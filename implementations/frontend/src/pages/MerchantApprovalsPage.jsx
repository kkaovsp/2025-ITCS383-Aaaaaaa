import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchPendingMerchants, approveMerchant } from "../services/api";

export default function MerchantApprovalsPage() {
  const [merchants, setMerchants] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPendingMerchants()
      .then(setMerchants)
      .catch(() => setError("Failed to fetch pending merchants"));
  }, []);

  const handleApprove = async (merchantId) => {
    try {
      await approveMerchant(merchantId);
      setMerchants((prev) => prev.filter((m) => m.merchant_id !== merchantId));
      setSuccess("Merchant approved");
      setTimeout(() => setSuccess(null), 2000);
    } catch {
      setError("Unable to approve merchant");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <button onClick={() => navigate(-1)}>← Back</button>
      <h2>Pending Merchant Approvals</h2>
      {error && <div style={{ color: "red" }}>{error}</div>}
      {success && <div style={{ color: "green" }}>{success}</div>}
      {merchants.length === 0 ? (
        <p>No pending merchants.</p>
      ) : (
        <ul>
          {merchants.map((m) => (
            <li key={m.merchant_id} style={{ marginBottom: 12 }}>
              <div>
                <strong>{m.merchant_id}</strong> ({m.citizen_id})
              </div>
              <div>{m.product_description}</div>
              <button onClick={() => handleApprove(m.merchant_id)}>Approve</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
