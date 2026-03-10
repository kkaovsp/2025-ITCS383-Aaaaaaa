import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerMerchant } from "../services/api";

export default function RegisterPage() {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    const payload = {
      username: form.get("username"),
      password: form.get("password"),
      name: form.get("name"),
      contact_info: form.get("contact_info"),
      citizen_id: form.get("citizen_id"),
      seller_information: form.get("seller_information"),
      product_description: form.get("product_description"),
      role: "MERCHANT",
    };

    try {
      await registerMerchant(payload);
      setSuccess("Registration submitted. Please wait for approval.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError("Registration failed. Please try again.");
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: "0 auto" }}>
      <h2>Register as Merchant</h2>
      {success && <div style={{ color: "green" }}>{success}</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>
            Username
            <input name="username" required style={{ width: "100%" }} />
          </label>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>
            Password
            <input name="password" type="password" required style={{ width: "100%" }} />
          </label>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>
            Full Name
            <input name="name" required style={{ width: "100%" }} />
          </label>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>
            Contact (Email/Phone)
            <input name="contact_info" required style={{ width: "100%" }} />
          </label>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>
            Citizen ID
            <input name="citizen_id" required style={{ width: "100%" }} />
          </label>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>
            Seller Information
            <textarea name="seller_information" style={{ width: "100%" }} />
          </label>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>
            Product Description
            <textarea name="product_description" style={{ width: "100%" }} />
          </label>
        </div>

        <button type="submit">Register</button>
      </form>
    </div>
  );
}
