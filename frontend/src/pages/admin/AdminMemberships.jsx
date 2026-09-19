import { useEffect, useState } from "react";

import api from "../../services/api";
import "./AdminMemberships.css";


function AdminMemberships() {
  const [memberships, setMemberships] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [editingLevel, setEditingLevel] = useState(null);

  const [submitting, setSubmitting] = useState(false);

  const [actionLevel, setActionLevel] = useState(null);

  const [formError, setFormError] = useState("");

  const [selectedImage, setSelectedImage] = useState(null);

  const [imagePreview, setImagePreview] = useState("");

  const [uploadingImage, setUploadingImage] = useState(false);


  const [formData, setFormData] = useState({
    level: "",
    product_name: "",
    product_photo: "",
    description: "",
    product_price: "",
    release_date: "",
    activation_fee: "",
    daily_reward: "",
    cycle_days: "",
    advertisement_message: "",
  });


  const fetchMemberships = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/api/edutech/memberships/"
      );

      setMemberships(response.data);

    } catch (error) {
      console.error(
        "Memberships error:",
        error
      );

      if (error.response?.status === 403) {
        setError(
          "You do not have permission to access memberships."
        );
      } else {
        setError(
          "Unable to load membership levels."
        );
      }

    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchMemberships();
  }, []);


  const resetForm = () => {
    setFormData({
      level: "",
      product_name: "",
      product_photo: "",
      description: "",
      product_price: "",
      release_date: "",
      activation_fee: "",
      daily_reward: "",
      cycle_days: "",
      advertisement_message: "",
    });

    setSelectedImage(null);
    setImagePreview("");

    setEditingLevel(null);
    setFormError("");
  };


  const handleOpenCreate = () => {
    resetForm();
    setShowForm(true);
  };


  const handleOpenEdit = (membership) => {
    setEditingLevel(membership.level);

    setFormData({
      level: membership.level,
      product_name: membership.product_name || "",
      product_photo: membership.product_photo || "",
      description: membership.description || "",
      product_price: membership.product_price || "",
      release_date: membership.release_date || "",
      activation_fee: membership.activation_fee || "",
      daily_reward: membership.daily_reward || "",
      cycle_days: membership.cycle_days || "",
      advertisement_message:
        membership.advertisement_message || "",
    });

    setSelectedImage(null);

    setImagePreview(
      membership.product_photo || ""
    );

    setFormError("");
    setShowForm(true);
  };


  const handleCloseForm = () => {
    if (submitting || uploadingImage) {
      return;
    }

    setShowForm(false);
    resetForm();
  };


  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  // =========================================================
  // IMAGE SELECTION
  // =========================================================

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setFormError("");

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setFormError(
        "Invalid image type. Please select a JPG, PNG, or WebP image."
      );

      event.target.value = "";

      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      setFormError(
        "Image is too large. Maximum size is 5 MB."
      );

      event.target.value = "";

      return;
    }

    setSelectedImage(file);

    const previewUrl = URL.createObjectURL(file);

    setImagePreview(previewUrl);
  };


  // =========================================================
  // UPLOAD IMAGE
  // =========================================================

  const uploadImage = async () => {
    if (!selectedImage) {
      return formData.product_photo || null;
    }

    const imageFormData = new FormData();

    imageFormData.append(
      "file",
      selectedImage
    );

    try {
      setUploadingImage(true);

      const response = await api.post(
        "/api/edutech/uploads/membership-image",
        imageFormData
      );

      const uploadedUrl =
        response.data.url;

      if (!uploadedUrl) {
        throw new Error(
          "Upload response did not contain an image URL."
        );
      }

      /*
       * The backend returns:
       *
       * /uploads/membership_images/filename.jpg
       *
       * Convert that relative backend path
       * into an absolute URL using the API base URL.
       */

      let fullImageUrl = uploadedUrl;

      try {
        const backendOrigin =
          new URL(
            api.defaults.baseURL ||
              window.location.origin,
            window.location.origin
          ).origin;

        if (uploadedUrl.startsWith("/")) {
          fullImageUrl =
            `${backendOrigin}${uploadedUrl}`;
        }
      } catch (urlError) {
        console.error(
          "Image URL conversion error:",
          urlError
        );
      }

      return fullImageUrl;

    } catch (error) {
      console.error(
        "Image upload error:",
        error
      );

      throw new Error(
        error.response?.data?.detail ||
        "Unable to upload product image."
      );

    } finally {
      setUploadingImage(false);
    }
  };


  // =========================================================
  // SUBMIT MEMBERSHIP
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setFormError("");
    setSubmitting(true);

    try {

      // Upload selected image first
      const productPhoto =
        await uploadImage();

      const payload = {
        product_name:
          formData.product_name,

        product_photo:
          productPhoto,

        description:
          formData.description,

        product_price:
          Number(
            formData.product_price
          ),

        release_date:
          formData.release_date,

        activation_fee:
          Number(
            formData.activation_fee
          ),

        daily_reward:
          Number(
            formData.daily_reward
          ),

        cycle_days:
          Number(
            formData.cycle_days
          ),

        advertisement_message:
          formData.advertisement_message,
      };


      if (editingLevel !== null) {

        await api.put(
          `/api/edutech/memberships/${editingLevel}`,
          payload
        );

      } else {

        await api.post(
          "/api/edutech/memberships/",
          {
            level:
              Number(formData.level),

            ...payload,
          }
        );
      }


      setShowForm(false);

      resetForm();

      await fetchMemberships();

    } catch (error) {

      console.error(
        "Membership save error:",
        error
      );

      setFormError(
        error.response?.data?.detail ||
        error.message ||
        "Unable to save membership level."
      );

    } finally {
      setSubmitting(false);
    }
  };


  // =========================================================
  // TOGGLE STATUS
  // =========================================================

  const handleToggleStatus = async (
    membership
  ) => {

    const action =
      membership.is_active
        ? "deactivate"
        : "activate";

    const confirmed =
      window.confirm(
        `Are you sure you want to ${action} Level ${membership.level}?`
      );

    if (!confirmed) {
      return;
    }

    try {

      setActionLevel(
        membership.level
      );

      if (membership.is_active) {

        await api.patch(
          `/api/edutech/memberships/${membership.level}/deactivate`
        );

      } else {

        await api.patch(
          `/api/edutech/memberships/${membership.level}/activate`
        );
      }

      await fetchMemberships();

    } catch (error) {

      console.error(
        "Membership status error:",
        error
      );

      window.alert(
        error.response?.data?.detail ||
        "Unable to update membership status."
      );

    } finally {
      setActionLevel(null);
    }
  };


  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = async (
    membership
  ) => {

    const confirmed =
      window.confirm(
        `Delete Level ${membership.level}?\n\n` +
        "This is a soft delete. Existing users who already activated this membership will not be affected."
      );

    if (!confirmed) {
      return;
    }

    try {

      setActionLevel(
        membership.level
      );

      await api.delete(
        `/api/edutech/memberships/${membership.level}`
      );

      await fetchMemberships();

    } catch (error) {

      console.error(
        "Membership delete error:",
        error
      );

      window.alert(
        error.response?.data?.detail ||
        "Unable to delete membership level."
      );

    } finally {
      setActionLevel(null);
    }
  };


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (
      <div className="admin-memberships-loading">

        <div className="admin-memberships-spinner"></div>

        <p>
          Loading membership levels...
        </p>

      </div>
    );
  }


  // =========================================================
  // ERROR
  // =========================================================

  if (error) {

    return (
      <div className="admin-memberships-error">

        <div className="admin-memberships-error-card">

          <h2>
            Membership Error
          </h2>

          <p>
            {error}
          </p>

          <button
            type="button"
            onClick={fetchMemberships}
          >
            Try Again
          </button>

        </div>

      </div>
    );
  }


  return (
    <div className="admin-memberships">

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <section className="admin-memberships-heading">

        <div>

          <h1>
            Membership Management
          </h1>

          <p>
            Create and manage membership packages
            available on the platform.
          </p>

        </div>


        <button
          type="button"
          className="admin-membership-create-button"
          onClick={handleOpenCreate}
          disabled={memberships.length >= 12}
        >
          + Create Membership
        </button>

      </section>


      {/* =================================================
          MEMBERSHIP COUNT
      ================================================= */}

      <div className="admin-membership-summary">

        <div>

          <span>
            Configured Levels
          </span>

          <strong>
            {memberships.length} / 12
          </strong>

        </div>


        <div>

          <span>
            Active Levels
          </span>

          <strong>
            {
              memberships.filter(
                (membership) =>
                  membership.is_active
              ).length
            }
          </strong>

        </div>


        <div>

          <span>
            Inactive Levels
          </span>

          <strong>
            {
              memberships.filter(
                (membership) =>
                  !membership.is_active
              ).length
            }
          </strong>

        </div>

      </div>


      {/* =================================================
          MEMBERSHIP GRID
      ================================================= */}

      {memberships.length === 0 ? (

        <div className="admin-memberships-empty">

          <h2>
            No Membership Levels
          </h2>

          <p>
            You have not created any membership
            levels yet.
          </p>

          <button
            type="button"
            onClick={handleOpenCreate}
          >
            Create First Membership
          </button>

        </div>

      ) : (

        <section className="admin-memberships-grid">

          {memberships.map(
            (membership) => (

              <article
                key={membership.level}
                className="admin-membership-card"
              >

                {/* HEADER */}

                <div className="admin-membership-card-header">

                  <span className="admin-membership-level">
                    Level {membership.level}
                  </span>


                  <span
                    className={
                      membership.is_active
                        ? "admin-membership-status active"
                        : "admin-membership-status inactive"
                    }
                  >
                    {membership.is_active
                      ? "Active"
                      : "Inactive"}
                  </span>

                </div>


                {/* PRODUCT PHOTO */}

                {membership.product_photo && (

                  <div className="admin-membership-photo">

                    <img
                      src={
                        membership.product_photo
                      }
                      alt={
                        membership.product_name
                      }
                    />

                  </div>

                )}


                {/* PRODUCT */}

                <h2>
                  {membership.product_name}
                </h2>


                <p className="admin-membership-description">
                  {membership.description}
                </p>


                {/* DETAILS */}

                <div className="admin-membership-details">

                  <div className="admin-membership-detail">

                    <span>
                      Product Price
                    </span>

                    <strong>
                      KES{" "}
                      {Number(
                        membership.product_price
                      ).toLocaleString()}
                    </strong>

                  </div>


                  <div className="admin-membership-detail">

                    <span>
                      Activation Fee
                    </span>

                    <strong>
                      KES{" "}
                      {Number(
                        membership.activation_fee
                      ).toLocaleString()}
                    </strong>

                  </div>


                  <div className="admin-membership-detail">

                    <span>
                      Daily Reward
                    </span>

                    <strong>
                      KES{" "}
                      {Number(
                        membership.daily_reward
                      ).toFixed(2)}
                    </strong>

                  </div>


                  <div className="admin-membership-detail">

                    <span>
                      Cycle
                    </span>

                    <strong>
                      {membership.cycle_days} days
                    </strong>

                  </div>


                  <div className="admin-membership-detail">

                    <span>
                      Release Date
                    </span>

                    <strong>
                      {membership.release_date}
                    </strong>

                  </div>

                </div>


                {/* ADVERTISEMENT */}

                <div className="admin-membership-ad">

                  <span>
                    Advertisement
                  </span>

                  <p>
                    {membership.advertisement_message}
                  </p>

                  <div className="admin-membership-ad-note">
                    WhatsApp sharing link is generated automatically.
                  </div>

                </div>


                {/* ACTIONS */}

                <div className="admin-membership-actions">

                  <button
                    type="button"
                    className="admin-membership-edit"
                    onClick={() =>
                      handleOpenEdit(
                        membership
                      )
                    }
                  >
                    Edit
                  </button>


                  <button
                    type="button"
                    className={
                      membership.is_active
                        ? "admin-membership-toggle deactivate"
                        : "admin-membership-toggle activate"
                    }
                    onClick={() =>
                      handleToggleStatus(
                        membership
                      )
                    }
                    disabled={
                      actionLevel ===
                      membership.level
                    }
                  >
                    {actionLevel ===
                    membership.level
                      ? "Please wait..."
                      : membership.is_active
                        ? "Deactivate"
                        : "Activate"}
                  </button>


                  <button
                    type="button"
                    className="admin-membership-delete"
                    onClick={() =>
                      handleDelete(
                        membership
                      )
                    }
                    disabled={
                      actionLevel ===
                      membership.level
                    }
                  >
                    Delete
                  </button>

                </div>

              </article>

            )
          )}

        </section>
      )}


      {/* =================================================
          CREATE / EDIT MODAL
      ================================================= */}

      {showForm && (

        <div className="admin-membership-modal">

          <div className="admin-membership-modal-card">

            <div className="admin-membership-modal-header">

              <div>

                <h2>
                  {editingLevel !== null
                    ? `Edit Level ${editingLevel}`
                    : "Create Membership Level"}
                </h2>

                <p>
                  Configure the complete membership
                  package.
                </p>

              </div>


              <button
                type="button"
                className="admin-membership-modal-close"
                onClick={handleCloseForm}
              >
                ×
              </button>

            </div>


            {formError && (

              <div className="admin-membership-form-error">
                {formError}
              </div>

            )}


            <form
              className="admin-membership-form"
              onSubmit={handleSubmit}
            >

              {/* LEVEL */}

              {editingLevel === null && (

                <div className="admin-membership-form-group">

                  <label htmlFor="level">
                    Membership Level
                  </label>

                  <input
                    id="level"
                    name="level"
                    type="number"
                    min="1"
                    max="12"
                    value={formData.level}
                    onChange={handleChange}
                    required
                    placeholder="1 - 12"
                  />

                </div>

              )}


              {/* PRODUCT NAME */}

              <div className="admin-membership-form-group">

                <label htmlFor="product_name">
                  Product Name
                </label>

                <input
                  id="product_name"
                  name="product_name"
                  type="text"
                  value={
                    formData.product_name
                  }
                  onChange={handleChange}
                  required
                  placeholder="Samsung Galaxy S26"
                />

              </div>


              {/* PRODUCT IMAGE */}

              <div className="admin-membership-form-group full">

                <label htmlFor="product_photo">
                  Product Image
                </label>

                <input
                  id="product_photo"
                  name="product_photo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                />

                <small>
                  JPG, PNG or WebP. Maximum size: 5 MB.
                </small>


                {/* IMAGE PREVIEW */}

                {imagePreview && (

                  <div className="admin-membership-image-preview">

                    <img
                      src={imagePreview}
                      alt="Product preview"
                    />

                  </div>

                )}

                {selectedImage && (

                  <p className="admin-membership-selected-image">
                    Selected:{" "}
                    {selectedImage.name}
                  </p>

                )}

              </div>


              {/* DESCRIPTION */}

              <div className="admin-membership-form-group full">

                <label htmlFor="description">
                  Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  value={
                    formData.description
                  }
                  onChange={handleChange}
                  required
                  rows="4"
                  placeholder="Describe the product..."
                />

              </div>


              {/* PRODUCT PRICE */}

              <div className="admin-membership-form-group">

                <label htmlFor="product_price">
                  Product Price (KES)
                </label>

                <input
                  id="product_price"
                  name="product_price"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={
                    formData.product_price
                  }
                  onChange={handleChange}
                  required
                />

              </div>


              {/* RELEASE DATE */}

              <div className="admin-membership-form-group">

                <label htmlFor="release_date">
                  Release Date
                </label>

                <input
                  id="release_date"
                  name="release_date"
                  type="text"
                  value={
                    formData.release_date
                  }
                  onChange={handleChange}
                  required
                  placeholder="September 2026"
                />

              </div>


              {/* ACTIVATION FEE */}

              <div className="admin-membership-form-group">

                <label htmlFor="activation_fee">
                  Activation Fee (KES)
                </label>

                <input
                  id="activation_fee"
                  name="activation_fee"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={
                    formData.activation_fee
                  }
                  onChange={handleChange}
                  required
                />

              </div>


              {/* DAILY REWARD */}

              <div className="admin-membership-form-group">

                <label htmlFor="daily_reward">
                  Daily Reward (KES)
                </label>

                <input
                  id="daily_reward"
                  name="daily_reward"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={
                    formData.daily_reward
                  }
                  onChange={handleChange}
                  required
                />

              </div>


              {/* CYCLE */}

              <div className="admin-membership-form-group">

                <label htmlFor="cycle_days">
                  Cycle Days
                </label>

                <input
                  id="cycle_days"
                  name="cycle_days"
                  type="number"
                  min="1"
                  value={
                    formData.cycle_days
                  }
                  onChange={handleChange}
                  required
                />

              </div>


              {/* ADVERTISEMENT MESSAGE */}

              <div className="admin-membership-form-group full">

                <label htmlFor="advertisement_message">
                  Advertisement Message
                </label>

                <textarea
                  id="advertisement_message"
                  name="advertisement_message"
                  value={
                    formData.advertisement_message
                  }
                  onChange={handleChange}
                  required
                  rows="5"
                  placeholder="Write the message users will share on WhatsApp..."
                />

                <small>
                  This message will be automatically
                  converted into a WhatsApp sharing link
                  for users.
                </small>

              </div>


              {/* BUTTONS */}

              <div className="admin-membership-form-actions">

                <button
                  type="button"
                  className="admin-membership-cancel"
                  onClick={handleCloseForm}
                  disabled={
                    submitting ||
                    uploadingImage
                  }
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="admin-membership-save"
                  disabled={
                    submitting ||
                    uploadingImage
                  }
                >

                  {uploadingImage
                    ? "Uploading Image..."
                    : submitting
                      ? "Saving..."
                      : editingLevel !== null
                        ? "Save Changes"
                        : "Create Membership"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}


export default AdminMemberships;