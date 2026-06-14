import React, { useEffect, useState } from "react";
import { authenticatedFetch } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function MyGroupOrders() {
  const [groups, setGroups] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        // For now, fetch groups by querying a user-facing endpoint if available.
        // This backend doesn't yet have a 'my groups' endpoint; as a simple fallback,
        // attempt to load nothing.
        setGroups([]);
      } catch (e) {
        console.error(e);
      }
    };

    load();
  }, []);

  return (
    <div>
      <h2>My Group Orders</h2>
      {groups.length === 0 ? (
        <div>No group orders yet.</div>
      ) : (
        <ul>
          {groups.map((g) => (
            <li key={g.group_id}>{g.product_name} — {g.invite_code}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
