import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowPathIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/solid";
import { authenticatedFetch } from "../services/api";

const StatusBadge = ({ status }) => {
  const statusMap = {
    Open: {
      bg: "bg-orange-100",
      text: "text-orange-800",
      icon: "⏳",
    },
    "In Progress": {
      bg: "bg-blue-100",
      text: "text-blue-800",
      icon: "🔄",
    },
    Resolved: {
      bg: "bg-green-100",
      text: "text-green-800",
      icon: "✅",
    },
  };

  const style = statusMap[status] || statusMap.Open;

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${style.bg} ${style.text}`}>
      {style.icon} {status}
    </span>
  );
};

const PriorityBadge = ({ priority }) => {
  const priorityMap = {
    Low: "bg-green-50 text-green-700 border border-green-200",
    Medium: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    High: "bg-red-50 text-red-700 border border-red-200",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${priorityMap[priority] || priorityMap.Medium}`}>
      {priority}
    </span>
  );
};

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
    fetchTickets();
    // Listen for ticket creation events to refresh the list
    const onTicketCreated = (e) => {
      fetchTickets();
    };

    const onStorage = (e) => {
      if (e.key === "last_ticket_created") {
        fetchTickets();
      }
    };

    window.addEventListener("ticketCreated", onTicketCreated);
    window.addEventListener("storage", onStorage);

    // If a ticket was created earlier in this tab, trigger a refresh
    try {
      const last = localStorage.getItem("last_ticket_created");
      if (last) fetchTickets();
    } catch (e) {
      // ignore
    }

    return () => {
      window.removeEventListener("ticketCreated", onTicketCreated);
      window.removeEventListener("storage", onStorage);
    };
  }, [navigate, statusFilter]);

  const fetchTickets = async () => {
    setLoading(true);
    setError("");

    try {
      const url =
        statusFilter === "All"
          ? "http://localhost:8000/api/tickets"
          : `http://localhost:8000/api/tickets?status=${statusFilter}`;

      const data = await authenticatedFetch(url, {}, navigate);
      setTickets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-fuchsia-50 p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600">
              <DocumentTextIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">My Support Tickets</h1>
              <p className="mt-1 text-sm text-slate-600">
                Track and manage your support requests
              </p>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="mb-6 flex gap-2 flex-wrap">
          {["All", "Open", "In Progress", "Resolved"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                statusFilter === status
                  ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="h-8 w-8 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin"></div>
              <p className="mt-4 text-slate-600">Loading tickets...</p>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-3xl bg-red-50 border border-red-200 p-6 text-center">
            <p className="text-red-700 font-semibold">{error}</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="rounded-3xl bg-white p-12 text-center shadow-lg">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Tickets Found</h3>
            <p className="text-slate-600 mb-6">
              {statusFilter === "All"
                ? "You haven't created any support tickets yet."
                : `You have no ${statusFilter.toLowerCase()} tickets.`}
            </p>
            <button
              onClick={() => navigate("/chat")}
              className="rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3 text-sm font-semibold text-white hover:shadow-lg transition-all"
            >
              Create Support Ticket
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <div
                key={ticket.ticket_id}
                className="rounded-3xl bg-white p-6 shadow-md hover:shadow-lg transition-all border border-slate-100"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
                  {/* Ticket ID */}
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                      Ticket ID
                    </p>
                    <p className="font-mono font-bold text-slate-900">{ticket.ticket_id}</p>
                  </div>

                  {/* Subject */}
                  <div className="lg:col-span-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                      Subject
                    </p>
                    <p className="text-sm font-medium text-slate-900 line-clamp-2">
                      {ticket.subject}
                    </p>
                  </div>

                  {/* Status */}
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                      Status
                    </p>
                    <StatusBadge status={ticket.status} />
                  </div>

                  {/* Priority */}
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                      Priority
                    </p>
                    <PriorityBadge priority={ticket.priority} />
                  </div>

                  {/* Created Date */}
                  <div className="lg:col-span-1">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                      Created
                    </p>
                    <p className="text-xs text-slate-600">{formatDate(ticket.created_at)}</p>
                  </div>

                  {/* Category */}
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                      Category
                    </p>
                    <p className="text-sm text-slate-700">{ticket.category}</p>
                  </div>

                  {/* Description */}
                  <div className="lg:col-span-5">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                      Description
                    </p>
                    <p className="text-sm text-slate-700 line-clamp-2">{ticket.description}</p>
                  </div>

                  {/* Action Button */}
                  <div className="lg:col-span-5">
                    <button className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
