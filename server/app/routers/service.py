from fastapi import APIRouter, Depends, HTTPException, status, Form, File, UploadFile
from typing import List, Optional
from uuid import UUID, uuid4
from datetime import datetime
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Service, User, ServiceImage
from app.core.security import require_role
from app.utils.supabase_client import supabase
from app.schemas.services import ServiceResponse, GeoPoint, ServiceCategory, PricingType
import mimetypes
import json

router = APIRouter(prefix="/services", tags=["services"])



@router.post("/", response_model=ServiceResponse, status_code=status.HTTP_201_CREATED, description="Create a new service")
async def create_service(
    category: str = Form(...),
    title: str = Form(...),
    description: Optional[str] = Form(None),
    tags: Optional[str] = Form(None),
    base_price: float = Form(...),
    pricing_type: str = Form(...),
    amenities: Optional[str] = Form(None),
    address_line1: Optional[str] = Form(None),
    address_line2: Optional[str] = Form(None),
    area: Optional[str] = Form(None),
    city: str = Form(...),
    state: str = Form(...),
    country: str = Form(...),
    pincode: str = Form(...),
    geo_point: Optional[str] = Form(None),
    images: List[UploadFile] = File([]),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["vendor"]))
):
    try:
        # Parse tags and amenities
        tags_list = json.loads(tags) if tags else []
        amenities_list = json.loads(amenities) if amenities else []
        
        # Parse geo_point
        geo_point_dict = json.loads(geo_point) if geo_point else None
        if geo_point_dict:
            geo_point_dict = GeoPoint(**geo_point_dict).dict()

        # Validate category and pricing_type
        try:
            category_enum = ServiceCategory(category)
            pricing_type_enum = PricingType(pricing_type)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid category or pricing type"
            )

        # Check for existing service
        existing_service = db.query(Service).filter(
            Service.vendor_id == current_user.id,
            Service.category == category_enum,
            Service.title == title,
            Service.city == city,
            Service.pincode == pincode
        ).first()
        
        if existing_service:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A service with these details already exists"
            )

        # Generate slug and service code
        slug = f"{title.lower().replace(' ', '-')}-{uuid4().hex[:8]}"
        service_code = f"SVC-{uuid4().hex[:8].upper()}"

        # Create service
        db_service = Service(
            vendor_id=current_user.id,
            category=category_enum,
            title=title,
            slug=slug,
            service_code=service_code,
            description=description,
            tags=tags_list,
            base_price=base_price,
            currency="INR",
            pricing_type=pricing_type_enum,
            amenities=amenities_list,
            address_line1=address_line1,
            address_line2=address_line2,
            area=area,
            city=city,
            state=state,
            country=country,
            pincode=pincode,
            geo_point=geo_point_dict,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            featured=False,
            verified=False,
            is_active=True
        )
        
        db.add(db_service)
        db.commit()
        db.refresh(db_service)

        # Upload images to Supabase
        image_urls = []
        for img in images:
            file_bytes = await img.read()
            file_ext = img.filename.split(".")[-1]
            file_path = f"services/{uuid4()}.{file_ext}"

            # Detect MIME type
            content_type, _ = mimetypes.guess_type(img.filename)
            if not content_type:
                content_type = "application/octet-stream"

            try:
                supabase.storage.from_("service-images").upload(
                    path=file_path,
                    file=file_bytes,
                    file_options={"content-type": content_type}
                )
                public_url = supabase.storage.from_("service-images").get_public_url(file_path)
                db_image = ServiceImage(service_id=db_service.id, image_url=public_url, path=file_path)
                db.add(db_image)
                image_urls.append(public_url)
            except Exception as e:
                db.rollback()
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Image upload failed: {str(e)}"
                )

        db.commit()
        db.refresh(db_service)

        # Prepare response
        response = ServiceResponse(
            **db_service.__dict__,
            images=image_urls,
            message="Service created successfully"
        )
        
        return response

    except ValueError as ve:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while creating the service: {str(e)}"
        )