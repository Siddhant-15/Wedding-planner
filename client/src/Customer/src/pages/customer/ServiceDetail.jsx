// ServiceDetail.jsx

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useParams,
  Link,
  useNavigate,
} from "react-router-dom";

import {
  ArrowLeft,
  AlertTriangle,
  Loader2,
  Tag,
  Music,
  Sparkles,
  ClipboardList,
  PenSquare,
  CalendarRange,
} from "lucide-react";

import BackButton from "../../components/BackButton";
import HeroCarousel from "../../components/HeroCarousel";
import ServiceInfoCard from "../../components/ServiceInfoCard";
import MediaGalleryTabs from "../../components/MediaGalleryTabs";

import VendorCard from "../../components/customer/cards/VendorCard";
import VariantsCard from "../../components/customer/cards/VariantsCard";
import AddressCard from "../../components/customer/cards/AddressCard";
import AmenitiesCard from "../../components/customer/cards/AmenitiesCard";

import VenueSpecsCard from "../../components/customer/specs/VenueSpecsCard";
import CateringSpecsCard from "../../components/customer/specs/CateringSpecsCard";
import PhotographySpecsCard from "../../components/customer/specs/PhotographySpecsCard";
import GenericSpecsCard from "../../components/customer/specs/GenericSpecsCard";

import ReviewsList from "../../components/customer/reviews/ReviewsList";
import WriteReviewForm from "../../components/customer/reviews/WriteReviewForm";

import LeadForm from "../../../../lead-management/components/LeadForm";

import Modal from "../../../../components/ui/Modal";
import RequestSuccess from "../../../../request-pages/RequestSuccess";

import { customerService } from "../../../../utils/api/services/customer.service";
import { leadsService } from "../../../../utils/api/services/leads.service";
import { reviewService } from "../../../../utils/api/services/review.service";

import { titleCase } from "../../utils/format";

import styles from "../../styles/ServiceDetail.module.css";

const MEDIA_LIMIT = 12;

export default function ServiceDetail() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [service, setService] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  const [reviews, setReviews] =
    useState([]);

  const [reviewsLoading, setReviewsLoading] =
    useState(true);

  const [
    isReviewModalOpen,
    setIsReviewModalOpen,
  ] = useState(false);

  const [
    isAvailabilityModalOpen,
    setIsAvailabilityModalOpen,
  ] = useState(false);

  const [lead, setLead] =
    useState(null);

  const [checkingLead, setCheckingLead] =
    useState(true);

  const [inWishlist, setInWishlist] =
    useState(false);

  // MEDIA STATES
  const [allMedia, setAllMedia] =
    useState([]);

  const [mediaPage, setMediaPage] =
    useState(1);

  const [mediaLoading, setMediaLoading] =
    useState(false);

  const [hasMoreMedia, setHasMoreMedia] =
    useState(false);

  /* =========================================================
     LOAD SERVICE
  ========================================================= */

  useEffect(() => {
    let cancelled = false;

    const loadService = async () => {
      try {
        setLoading(true);

        setError(null);

        const res =
          await customerService.getDetail(
            id
          );

        if (!cancelled) {
          setService(res);

          // INITIAL MEDIA
          setAllMedia(
            res.media || []
          );

          setHasMoreMedia(
            res.has_more_media ||
            false
          );

          setMediaPage(1);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.message ||
            "Failed to load"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    if (id) {
      loadService();
    }

    return () => {
      cancelled = true;
    };
  }, [id]);

  /* =========================================================
     LOAD REVIEWS
  ========================================================= */

  useEffect(() => {
    let cancelled = false;

    const loadReviews = async () => {
      try {
        setReviewsLoading(true);

        const res =
          await reviewService.getAll(id);

        if (!cancelled) {
          setReviews(
            res?.reviews ||
            res ||
            []
          );
        }
      } catch (err) {
        console.error(
          "Failed to load reviews",
          err
        );
      } finally {
        if (!cancelled) {
          setReviewsLoading(false);
        }
      }
    };

    if (id) {
      loadReviews();
    }

    return () => {
      cancelled = true;
    };
  }, [id]);

  /* =========================================================
     CHECK EXISTING LEAD
  ========================================================= */

  useEffect(() => {
    if (!id || !service?.vendor?.id)
      return;

    checkExistingLead();
  }, [id, service]);

  const checkExistingLead =
    async () => {
      try {
        setCheckingLead(true);

        const requests =
          await leadsService.getMyRequests();

        const existingLead =
          requests?.find(
            (item) =>
              Number(item.vendor_id) ===
              Number(
                service?.vendor?.id
              ) &&
              Number(
                item.service_id
              ) ===
              Number(service?.id)
          );

        if (!existingLead) {
          setLead(null);
          return;
        }

        const eventDate =
          existingLead.event_date
            ? new Date(
              existingLead.event_date
            )
            : null;

        const createdAt = new Date(
          existingLead.created_at
        );

        const now = new Date();

        const diffDays =
          Math.floor(
            (now - createdAt) /
            (1000 *
              60 *
              60 *
              24)
          );

        const isExpired =
          existingLead.status ===
          "closed" ||
          existingLead.status ===
          "expired" ||
          existingLead.status ===
          "won" ||
          existingLead.status ===
          "lost" ||
          existingLead.customer_status ===
          "BOOKED" ||
          existingLead.customer_status ===
          "CUSTOMER_CLOSED" ||
          existingLead.customer_status ===
          "VENDOR_CLOSED" ||
          existingLead.customer_status ===
          "DATE_UNAVAILABLE" ||
          existingLead.customer_status ===
          "VENDOR_REJECTED" ||
          (eventDate &&
            eventDate < now) ||
          diffDays >= 7;

        if (isExpired) {
          setLead(null);
        } else {
          setLead(existingLead);
        }
      } catch (err) {
        console.error(
          "Failed to check existing lead",
          err
        );
      } finally {
        setCheckingLead(false);
      }
    };

  /* =========================================================
     LOAD MORE MEDIA
  ========================================================= */

  const loadMoreMedia =
    async () => {
      try {
        if (
          mediaLoading ||
          !hasMoreMedia
        )
          return;

        setMediaLoading(true);

        const nextSkip =
          allMedia.length;

        const res =
          await customerService.getServiceMedia(
            id,
            nextSkip,
            MEDIA_LIMIT
          );

        const incoming =
          res?.media || [];

        setAllMedia((prev) => {
          const existing =
            new Set(
              prev.map(
                (m) =>
                  m.media_url
              )
            );

          const filtered =
            incoming.filter(
              (m) =>
                !existing.has(
                  m.media_url
                )
            );

          return [
            ...prev,
            ...filtered,
          ];
        });

        setHasMoreMedia(
          res?.has_more ||
          false
        );

        setMediaPage(
          (prev) => prev + 1
        );
      } catch (err) {
        console.error(
          "Failed to load more media",
          err
        );
      } finally {
        setMediaLoading(false);
      }
    };

  /* =========================================================
     LEAD SUBMIT
  ========================================================= */

  const handleLeadSubmit =
    async (payload) => {
      try {
        const formattedPayload = {
          vendor_id:
            service.vendor?.id,

          service_id:
            service.id,

          service_type:
            service.service_type,

          event_type:
            payload.eventType,

          event_date:
            payload.eventDate,

          event_time:
            payload.eventTime,

          location:
            payload.location,

          budget:
            payload.budget,

          guests:
            payload.guests,

          description:
            payload.description,

          name:
            payload.name,

          phone:
            payload.phone,

          email:
            payload.email,
        };

        const createdLead =
          await leadsService.createLead(
            formattedPayload
          );

        setLead(createdLead);

        setIsAvailabilityModalOpen(
          false
        );
      } catch (err) {
        console.error(
          "Lead creation failed:",
          err
        );
      }
    };

  /* =========================================================
     SHARE
  ========================================================= */

  const handleShare =
    async () => {
      try {
        if (navigator.share) {
          await navigator.share({
            title: service.name,
            url: window.location.href,
          });
        } else {
          await navigator.clipboard.writeText(
            window.location.href
          );

          alert("Link copied!");
        }
      } catch (err) {
        console.error(err);
      }
    };

  /* =========================================================
     WISHLIST
  ========================================================= */

  const toggleWishlist = () => {
    setInWishlist((prev) => !prev);
  };

  /* =========================================================
     SPECS
  ========================================================= */

  const renderSpecs = useMemo(() => {
    if (!service) return null;

    switch (
    service.service_type
    ) {
      case "venue":
        return (
          <VenueSpecsCard
            venue={service.venue}
          />
        );

      case "catering":
        return (
          <CateringSpecsCard
            catering={
              service.catering
            }
          />
        );

      case "photography":
        return (
          <PhotographySpecsCard
            photography={
              service.photography
            }
          />
        );

      case "dj":
        return (
          <GenericSpecsCard
            title="DJ Specifications"
            data={service.dj}
            icon={Music}
          />
        );

      case "makeup_artist":
        return (
          <GenericSpecsCard
            title="Makeup Specifications"
            data={
              service.makeup_artist
            }
            icon={Sparkles}
          />
        );

      case "event_management":
        return (
          <GenericSpecsCard
            title="Event Management"
            data={
              service.event_management
            }
            icon={
              ClipboardList
            }
          />
        );

      default:
        return null;
    }
  }, [service]);

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div
        className={
          styles.stateWrap
        }
        role="status"
        aria-live="polite"
      >
        <Loader2
          className={
            styles.spinner
          }
          size={28}
        />

        <p>
          Loading service…
        </p>
      </div>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (error || !service) {
    return (
      <div
        className={
          styles.stateWrap
        }
        role="alert"
      >
        <AlertTriangle
          size={28}
          className={
            styles.errorIcon
          }
        />

        <h2>
          Service unavailable
        </h2>

        <p>
          {error ||
            "We couldn't find this service."}
        </p>

        <Link
          to={`/services/${service?.service_type}`}
          className={
            styles.backLink
          }
        >
          <ArrowLeft
            size={16}
          />

          Back to services
        </Link>
      </div>
    );
  }

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className={styles.page}>
      <div
        className={
          styles.topContainer
        }
      >
        <BackButton
          label="Back"
          onClick={() => {
            if (
              window.history
                .length > 1
            ) {
              navigate(-1);
            } else {
              navigate(
                `/services/${service.service_type}`
              );
            }
          }}
        />
      </div>

      <div className={styles.layout}>
        {/* LEFT COLUMN */}
        <div
          className={
            styles.leftColumn
          }
        >
          {/* HERO */}
          <section
            className={
              styles.heroSection
            }
          >
            <div
              className={
                styles.heroLeft
              }
            >
              <div
                className={
                  styles.heroContainer
                }
              >
                <HeroCarousel
                  media={
                    allMedia ||
                    []
                  }
                  serviceName={
                    service.name
                  }
                />
              </div>

              <div
                className={
                  styles.infoWrap
                }
              >
                <ServiceInfoCard
                  serviceType={titleCase(
                    service.service_type
                  )}
                  serviceName={
                    service.name
                  }
                  location={[
                    service.area,
                    service.city,
                    service.state,
                  ]
                    .filter(Boolean)
                    .join(" • ")}
                  rating={
                    service.rating
                  }
                  reviewCount={
                    service.total_reviews
                  }
                  verified={
                    service.verified
                  }
                  inWishlist={
                    inWishlist
                  }
                  onWishlist={
                    toggleWishlist
                  }
                  onShare={
                    handleShare
                  }
                  onWriteReview={() =>
                    setIsReviewModalOpen(
                      true
                    )
                  }
                />
              </div>
            </div>
          </section>

          {/* CONTENT */}
          <div
            className={
              styles.contentStack
            }
          >
            <MediaGalleryTabs
              media={allMedia}
              serviceName={
                service.name
              }
              hasMore={
                hasMoreMedia
              }
              onLoadMore={
                loadMoreMedia
              }
              loadingMore={
                mediaLoading
              }
            />

            <section
              className={
                styles.card
              }
            >
              <h2
                className={
                  styles.sectionTitle
                }
              >
                About this service
              </h2>

              <p
                className={
                  styles.description
                }
              >
                {
                  service.description
                }
              </p>

              {!!service.tags
                ?.length && (
                  <div
                    className={
                      styles.tags
                    }
                  >
                    {service.tags.map(
                      (t) => (
                        <span
                          key={t}
                          className={
                            styles.tag
                          }
                        >
                          <Tag
                            size={
                              12
                            }
                          />
                          {t}
                        </span>
                      )
                    )}
                  </div>
                )}
            </section>

            {renderSpecs}

            <VariantsCard
              variants={
                service.variants
              }
            />

            <AmenitiesCard
              amenities={
                service.amenities
              }
            />

            <AddressCard
              addressLine1={
                service.add_line1 ||
                service.area
              }
              addressLine2={
                service.add_line2
              }
              city={
                service.city
              }
              state={
                service.state
              }
              pincode={
                service.pincode
              }
            />

            <section
              className={
                styles.card
              }
            >
              <div
                className={
                  styles.reviewsHeader
                }
              >
                <h2
                  className={
                    styles.sectionTitle
                  }
                >
                  Reviews &
                  Ratings
                </h2>

                <button
                  onClick={() =>
                    setIsReviewModalOpen(
                      true
                    )
                  }
                  className={
                    styles.writeReviewBtn
                  }
                >
                  <PenSquare
                    size={16}
                  />
                  Write a Review
                </button>
              </div>

              <ReviewsList
                reviews={
                  reviews
                }
                overallRating={
                  service.rating
                }
                totalReviews={
                  service.total_reviews
                }
                loading={
                  reviewsLoading
                }
              />
            </section>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <aside
          className={
            styles.rightColumn
          }
        >
          <div
            className={
              styles.stickyWrap
            }
          >
            {checkingLead ? (
              <div
                className={
                  styles.quoteLoading
                }
              >
                <Loader2
                  size={22}
                  className={
                    styles.spinner
                  }
                />

                <p>
                  Checking request
                  status...
                </p>
              </div>
            ) : lead ? (
              <RequestSuccess
                vendorName={
                  service.name
                }
                serviceType={titleCase(
                  service.service_type
                )}
                onViewRequest={() => {
                  navigate(
                    `/customer/request?request=${lead.id}`
                  );
                }}
              />
            ) : (
              <>
                <button
                  onClick={() =>
                    setIsAvailabilityModalOpen(
                      true
                    )
                  }
                  className={
                    styles.checkAvailabilityBtn
                  }
                >
                  <CalendarRange
                    size={18}
                  />
                  Get Quote
                </button>

                <Modal
                  isOpen={
                    isAvailabilityModalOpen
                  }
                  onClose={() =>
                    setIsAvailabilityModalOpen(
                      false
                    )
                  }
                >
                  <LeadForm
                    vendorName={
                      service.name
                    }
                    expectedResponseTime="2 hours"
                    onSubmit={
                      handleLeadSubmit
                    }
                  />
                </Modal>
              </>
            )}

            <VendorCard
              vendor={
                service.vendor
              }
            />
          </div>
        </aside>
      </div>

      {/* REVIEW MODAL */}
      <Modal
        isOpen={
          isReviewModalOpen
        }
        onClose={() =>
          setIsReviewModalOpen(
            false
          )
        }
      >
        <WriteReviewForm
          serviceName={
            service.name
          }
          serviceId={id}
          serviceType={
            service.service_type
          }
          vendorId={
            service.vendor?.id ||
            ""
          }
          onReviewSubmitted={(
            newReview
          ) => {
            setReviews(
              (prev) => [
                newReview,
                ...prev,
              ]
            );

            setIsReviewModalOpen(
              false
            );
          }}
        />
      </Modal>
    </div>
  );
}