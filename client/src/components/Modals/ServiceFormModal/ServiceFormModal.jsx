// src/components/services/ServiceFormModal/ServiceFormModal.jsx

import React from 'react';
import { X, Sparkles } from 'lucide-react';
import styles from '../../../styles/ServiceForm.module.css';

import { steps } from './formConstants';
import { useServiceForm } from './hooks/useServiceForm';

import StepBasicInfo from './steps/StepBasicInfo';
import StepPricing from './steps/StepPricing';
import StepSpecificDetails from './steps/StepSpecificDetails';
import StepAmenitiesImages from './steps/StepAmenitiesImages';
import StepReview from './steps/StepReview';

const ServiceFormModal = ({
    isOpen,
    onClose,
    onCreate,           // called when creating a new service
    onUpdate,           // called when editing an existing service
    editingService,     // the service being edited (null when creating)
}) => {
    // Resolve a single callback the hook can use:
    // - edit mode  → onUpdate(formData, id)
    // - create mode → onCreate(formData)
    const onSubmitCallback = editingService
        ? (formData, id) => onUpdate(formData, id)
        : (formData) => onCreate(formData);

    const {
        currentStep,
        setCurrentStep,
        formData,
        newTag, setNewTag,
        newAmenity, setNewAmenity,
        newGenre, setNewGenre,
        newEquipment, setNewEquipment,
        newListItem, setNewListItem,
        newCuisine, setNewCuisine,
        newSpecialDiet, setNewSpecialDiet,
        existingImages,
        previewUrls,
        uploading,
        handleInputChange,
        handleVariantChange,
        handleAddVariant,
        handleRemoveVariant,
        handleGeoChange,
        handleImageChange,
        handleRemoveImage,
        handleNext,
        handleSubmit,
    } = useServiceForm(isOpen, editingService, onSubmitCallback, onClose);

    if (!isOpen) return null;

    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return (
                    <StepBasicInfo
                        formData={formData}
                        handleInputChange={handleInputChange}
                        handleGeoChange={handleGeoChange}
                        newTag={newTag}
                        setNewTag={setNewTag}
                    />
                );
            case 1:
                return (
                    <StepPricing
                        formData={formData}
                        handleInputChange={handleInputChange}
                        handleVariantChange={handleVariantChange}
                        handleAddVariant={handleAddVariant}
                        handleRemoveVariant={handleRemoveVariant}
                        initialData={editingService}
                    />
                );
            case 2:
                return (
                    <StepSpecificDetails
                        formData={formData}
                        handleInputChange={handleInputChange}
                        newGenre={newGenre}
                        setNewGenre={setNewGenre}
                        newEquipment={newEquipment}
                        setNewEquipment={setNewEquipment}
                        newCuisine={newCuisine}
                        setNewCuisine={setNewCuisine}
                        newSpecialDiet={newSpecialDiet}
                        setNewSpecialDiet={setNewSpecialDiet}
                        newListItem={newListItem}
                        setNewListItem={setNewListItem}
                    />
                );
            case 3:
                return (
                    <StepAmenitiesImages
                        formData={formData}
                        handleInputChange={handleInputChange}
                        newAmenity={newAmenity}
                        setNewAmenity={setNewAmenity}
                        handleImageChange={handleImageChange}
                        handleRemoveImage={handleRemoveImage}
                        previewUrls={previewUrls}
                        existingImages={existingImages}
                    />
                );
            case 4:
                return (
                    <StepReview
                        formData={formData}
                        setCurrentStep={setCurrentStep}
                        previewUrls={previewUrls}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modalWrapper}>
                <div className={styles.modal}>
                    {/* Header */}
                    <div className={styles.header}>
                        <div className={styles.headerLeft}>
                            <div className={styles.iconBox}>
                                <Sparkles className={styles.sparkleIcon} />
                            </div>
                            <div>
                                <h2 className={styles.title}>
                                    {editingService ? "Edit Service" : "Create New Service"}
                                </h2>
                                <p className={styles.subtitle}>
                                    {editingService
                                        ? "Update your service details"
                                        : "Add a new service to your portfolio"}
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} className={styles.closeBtn}>
                            <X className={styles.closeIcon} />
                        </button>
                    </div>

                    {/* Stepper */}
                    <div className={styles.stepper}>
                        {steps.map((step, index) => (
                            <div
                                key={index}
                                className={`${styles.step} ${index === currentStep ? styles.activeStep : ''} ${index < currentStep ? styles.completedStep : ''}`}
                                onClick={() => index <= currentStep && setCurrentStep(index)}
                            >
                                <span>{index + 1}</span>
                                <p>{step}</p>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        {renderStepContent()}

                        <div className={styles.actions}>
                            {currentStep > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep(prev => prev - 1)}
                                    className={styles.backBtn}
                                >
                                    Back
                                </button>
                            )}
                            {currentStep < steps.length - 1 ? (
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className={styles.nextBtn}
                                >
                                    Next
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className={styles.submitBtn}
                                >
                                    {uploading
                                        ? "Processing..."
                                        : editingService ? "Update Service" : "Publish Service"}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ServiceFormModal;