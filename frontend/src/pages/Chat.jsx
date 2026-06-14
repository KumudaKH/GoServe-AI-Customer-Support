import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PaperAirplaneIcon,
  TrashIcon,
  XMarkIcon,
  PhotoIcon,
  MicrophoneIcon,
  CameraIcon,
  PaperClipIcon,
} from "@heroicons/react/24/solid";
import { authenticatedFetch } from "../services/api";
import { useCart } from "../context/CartContext";
import MarkdownMessage from "../components/chat/MarkdownMessage";
import ResponseCards, { ActionButtons } from "../components/chat/ResponseCards";

const QUICK_ACTIONS = [
  { emoji: "📦", label: "Track Order", message: "Where is my order?" },
  { emoji: "💰", label: "Refund", message: "Refund my order" },
  { emoji: "🛍", label: "Recommend Products", message: "Recommend products for me" },
  { emoji: "🎫", label: "My Tickets", message: "Show my tickets" },
  { emoji: "👥", label: "Buy Together", message: "My buy together groups" },
  { emoji: "💳", label: "Payments", message: "Payment methods and issues" },
  { emoji: "🧠", label: "Ask Anything", message: "What is artificial intelligence?" },
];

const QuickActions = ({ onSelect }) => (
  <div className="mb-6 flex flex-wrap justify-center gap-2">
    {QUICK_ACTIONS.map((action) => (
      <button
        key={action.label}
        onClick={() => onSelect(action)}
        className="rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-xs font-medium text-violet-700 transition-all duration-300 hover:bg-violet-100 hover:shadow-md"
      >
        {action.emoji} {action.label}
      </button>
    ))}
  </div>
);

const TypingIndicator = () => (
  <div className="flex justify-start">
    <div className="rounded-3xl bg-gradient-to-r from-violet-50 to-fuchsia-50 px-6 py-4 shadow-md border border-violet-100">
      <div className="flex gap-2">
        <span className="text-sm text-slate-600">AI is typing</span>
        <div className="flex gap-1">
          <div className="h-2 w-2 rounded-full bg-violet-600 animate-bounce" />
          <div
            className="h-2 w-2 rounded-full bg-violet-600 animate-bounce"
            style={{ animationDelay: "0.1s" }}
          />
          <div
            className="h-2 w-2 rounded-full bg-violet-600 animate-bounce"
            style={{ animationDelay: "0.2s" }}
          />
        </div>
      </div>
    </div>
  </div>
);

const TicketModal = ({ isOpen, onClose, onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState({
    subject: "",
    category: "General",
    description: "",
    priority: "Medium",
  });
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    if (!formData.subject.trim() || !formData.description.trim()) {
      setError("Please fill in all required fields.");
      return;
    }
    try {
      await onSubmit(formData);
      // clear form only after successful creation
      setFormData({ subject: "", category: "General", description: "", priority: "Medium" });
      // close modal now that API succeeded
      onClose();
    } catch (err) {
      setError(err?.message || "Failed to create ticket. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-900">Create Support Ticket</h3>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-slate-900 disabled:opacity-50"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 border border-red-100 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <div>
            <label className="text-sm font-semibold text-slate-700">Subject *</label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="Brief subject"
              disabled={isSubmitting}
              className="w-full mt-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-600 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              disabled={isSubmitting}
              className="w-full mt-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-600 disabled:opacity-50"
            >
              <option>General</option>
              <option>Order Issue</option>
              <option>Refund</option>
              <option>Delivery</option>
              <option>Product Damage</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              disabled={isSubmitting}
              className="w-full mt-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-600 disabled:opacity-50"
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your issue..."
              disabled={isSubmitting}
              rows="4"
              className="w-full mt-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-600 disabled:opacity-50"
            />
          </div>

          <div className="flex gap-2">
            <button 
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <PhotoIcon className="h-4 w-4" />
              Image
            </button>
            <button 
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <MicrophoneIcon className="h-4 w-4" />
              Voice
            </button>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-sm font-semibold text-white hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                  Creating...
                </>
              ) : (
                "Submit"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const OrderCard = ({ response, onCreateTicket }) => {
  const parseOrderInfo = () => {
    const lines = response.split("\n");
    const info = {};
    lines.forEach((line) => {
      if (line.includes("Product:"))
        info.product = line.replace("Product:", "").trim();
      if (line.includes("Order ID:")) info.orderId = line.replace("Order ID:", "").trim();
      if (line.includes("Status:")) info.status = line.replace("Status:", "").trim();
      if (line.includes("Carrier:")) info.carrier = line.replace("Carrier:", "").trim();
      if (line.includes("Tracking Number:"))
        info.tracking = line.replace("Tracking Number:", "").trim();
      if (line.includes("Current Location:"))
        info.location = line.replace("Current Location:", "").trim();
    });
    return info;
  };

  const getStatusColor = (status) => {
    const lower = status.toLowerCase();
    if (lower.includes("delivered")) return { bg: "bg-green-50", text: "text-green-700", badge: "🟢" };
    if (lower.includes("out for delivery"))
      return { bg: "bg-orange-50", text: "text-orange-700", badge: "🟠" };
    if (lower.includes("shipped"))
      return { bg: "bg-blue-50", text: "text-blue-700", badge: "🔵" };
    if (lower.includes("cancelled"))
      return { bg: "bg-red-50", text: "text-red-700", badge: "🔴" };
    return { bg: "bg-slate-50", text: "text-slate-700", badge: "⚪" };
  };

  const info = parseOrderInfo();
  const statusColor = getStatusColor(info.status || "");

  return (
    <div className="flex justify-start">
      <div className="max-w-2xl space-y-4">
        <div className="rounded-3xl bg-white p-6 shadow-lg border border-slate-100">
          <div className="mb-6 pb-4 border-b border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              📦 Latest Order
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Product</p>
              <p className="mt-2 text-sm font-medium text-slate-900">{info.product || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Order ID</p>
              <p className="mt-2 text-sm font-medium text-slate-900">#{info.orderId || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</p>
              <p className={`mt-2 text-sm font-medium ${statusColor.text}`}>
                {statusColor.badge} {info.status || "Unknown"}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Carrier</p>
              <p className="mt-2 text-sm font-medium text-slate-900">{info.carrier || "N/A"}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Tracking Number
              </p>
              <p className="mt-2 text-sm font-medium text-slate-900">{info.tracking || "N/A"}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Current Location
              </p>
              <p className="mt-2 text-sm font-medium text-slate-900">{info.location || "N/A"}</p>
            </div>
          </div>

          <div className="mb-6 pb-6 border-b border-slate-200">
            <div className="grid grid-cols-2 gap-3">
              <button className="rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-3 text-sm font-semibold text-white hover:shadow-lg transition-all">
                📍 Track
              </button>
              <button className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                💬 Care
              </button>
              <button className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                💰 Refund
              </button>
              <button className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                📄 Details
              </button>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-slate-600 mb-3">Didn't solve your problem?</p>
            <button
              onClick={onCreateTicket}
              className="w-full rounded-2xl border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-100"
            >
              Create Support Ticket
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AIResponseCard = ({ response, source, cards, actions, onCreateTicket, onAction }) => (
  <div className="flex justify-start">
    <div className="max-w-2xl space-y-3">
      <div className="rounded-3xl bg-gradient-to-br from-violet-50 to-fuchsia-50 p-6 shadow-lg border border-violet-100">
        {source && (
          <span className="mb-3 inline-block rounded-full bg-white/80 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-600">
            {source === "goserve" ? "GoServe" : "AI"}
          </span>
        )}
        <MarkdownMessage content={response} />
        <ResponseCards cards={cards} onCreateTicket={onCreateTicket} />
        <ActionButtons actions={actions} onAction={onAction} />
      </div>
      {source === "goserve" && (
        <button
          onClick={onCreateTicket}
          className="rounded-2xl border border-violet-200 bg-white px-4 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-50"
        >
          Didn't solve your problem? Create Support Ticket
        </button>
      )}
    </div>
  </div>
);

export default function Chat() {
  const { items: cartItems, loyaltyPoints } = useCart();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [ticketModal, setTicketModal] = useState(false);
  const [ticketCreating, setTicketCreating] = useState(false);
  const [ticketId, setTicketId] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [documentPreview, setDocumentPreview] = useState(null);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [mediaStream, setMediaStream] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [recordingTimer, setRecordingTimer] = useState(0);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [speechError, setSpeechError] = useState(null);
  const timerRef = useRef(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraCaptured, setCameraCaptured] = useState(null);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [videoReady, setVideoReady] = useState(false);
  const [clearConfirm, setClearConfirm] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const recognitionInitialInputRef = useRef("");
  const recognitionTranscriptRef = useRef("");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const documentInputRef = useRef(null);
  const navigate = useNavigate();

  // Load chat history from localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const savedMessages = localStorage.getItem("chat_history");
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      }
    } catch (err) {
      console.error("Failed to load chat history:", err);
    }
  }, [navigate]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem("chat_history", JSON.stringify(messages));
    } catch (err) {
      console.error("Failed to save chat history:", err);
    }
  }, [messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      recognitionRef.current = null;
      setSpeechSupported(false);
      return;
    }

    setSpeechSupported(true);

    return () => {
      recognitionRef.current?.stop?.();
    };
  }, []);

  const formatTime = (seconds) => {
    const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const stopRecording = () => {
    console.log("Stopping recording");
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
      console.log("recorder.state", mediaRecorder.state);
    }
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => {
        console.log("Stopping track:", track.kind);
        track.stop();
      });
    }
    recognitionRef.current?.stop?.();
    setRecording(false);
    setMediaRecorder(null);
    setMediaStream(null);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startRecording = async () => {
    setSpeechError(null);
    setRecordingTimer(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("stream", stream);
      setMediaStream(stream);

      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      const chunks = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
          console.log("audioChunks", chunks);
        }
      };

      recorder.onstop = async () => {
        console.log("recorder.state", recorder.state);
        const audioBlob = new Blob(chunks, { type: "audio/webm" });
        console.log("audio blob created", audioBlob);
        await transcribeAudio(audioBlob);
      };

      recorder.start();
      console.log("recorder.state", recorder.state);

      timerRef.current = setInterval(() => {
        setRecordingTimer((prev) => prev + 1);
      }, 1000);

      setRecording(true);
    } catch (error) {
      console.error("Microphone permission error", error);
      const timestamp = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      const errorText =
        error.name === "NotAllowedError" || error.name === "PermissionDeniedError"
          ? "Microphone permission denied."
          : "Unable to access microphone.";
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          sender: "ai",
          text: errorText,
          isError: true,
          timestamp,
        },
      ]);
      setRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const formData = new FormData();
    formData.append("file", audioBlob, "voice.webm");

    try {
      const response = await fetch("http://localhost:8000/api/chat/transcribe", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      console.log("transcription response", data);
      if (!response.ok) {
        throw new Error(data.detail || data.error || data.message || "Transcription failed.");
      }

      const transcript = data.transcript || "";
      setInputValue((prev) => {
        const prefix = prev.trim();
        return prefix ? `${prefix} ${transcript}`.trim() : transcript;
      });
    } catch (error) {
      console.error("Transcription error", error);
      const timestamp = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          sender: "ai",
          text: error.message || "Voice transcription failed.",
          isError: true,
          timestamp,
        },
      ]);
    }
  };

  const handleMicToggle = () => {
    if (recording) {
      stopRecording();
      return;
    }
    startRecording();
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDocumentChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setDocumentPreview({ name: file.name, url, type: file.type });
  };

  const openCamera = async () => {
    console.log("navigator.mediaDevices:", navigator.mediaDevices);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError("Camera is not supported by this browser.");
      setCameraOpen(true);
      return;
    }

    setCameraLoading(true);
    setCameraError(null);
    setCameraOpen(true);
    setCameraCaptured(null);
    setVideoReady(false);

    const timeoutId = setTimeout(() => {
      setCameraLoading(false);
      setCameraError("Unable to access camera.");
    }, 5000);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      console.log("Stream received:", stream);
      console.log("videoRef.current:", videoRef.current);

      clearTimeout(timeoutId);
      setCameraStream(stream);
    } catch (error) {
      clearTimeout(timeoutId);
      console.error("Camera error:", error);
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);

      let errorMsg = "Unable to access camera.";

      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        errorMsg = "Camera permission denied.";
      } else if (error.name === "NotFoundError") {
        errorMsg = "No camera device found on this device.";
      } else if (error.name === "NotReadableError") {
        errorMsg = "Camera is already in use by another application.";
      } else if (error.name === "SecurityError") {
        errorMsg = "Camera access requires a secure context (HTTPS).";
      }

      setCameraError(errorMsg);
      setCameraLoading(false);
      setVideoReady(false);
    }
  };

  const closeCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => {
        console.log("Stopping track:", track.kind);
        track.stop();
      });
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.pause();
    }
    setCameraStream(null);
    setCameraCaptured(null);
    setCameraLoading(false);
    setCameraError(null);
    setVideoReady(false);
    setCameraOpen(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) return;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL("image/jpeg", 0.85);
    setCameraCaptured(imageData);
  };

  const sendCapturedImage = () => {
    setImagePreview(cameraCaptured);
    closeCamera();
  };

  useEffect(() => {
    if (!cameraOpen || !cameraStream || !videoRef.current) {
      return;
    }

    const video = videoRef.current;
    video.srcObject = cameraStream;

    const startPlayback = async () => {
      try {
        await video.play();
        console.log("Video playback started, readyState:", video.readyState);
        setCameraLoading(false);
        setVideoReady(true);
      } catch (playError) {
        console.error("Video play error:", playError);
        setCameraError("Unable to play video stream.");
        setCameraLoading(false);
        setVideoReady(false);
      }
    };

    startPlayback();
  }, [cameraOpen, cameraStream]);

  const buildConversationHistory = (msgs) =>
    msgs
      .filter((m) => m.text && !m.isError)
      .slice(-10)
      .map((m) => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text,
      }));

  const handleActionClick = (action) => {
    if (action.url) {
      navigate(action.url);
      return;
    }
    if (action.action === "ticket") {
      setTicketModal(true);
    }
  };

  const sendMessage = async (overrideMessage) => {
    const trimmedMessage = (overrideMessage || inputValue).trim();
    if (!trimmedMessage && !imagePreview && !documentPreview) return;

    const userMessage = trimmedMessage || (documentPreview ? documentPreview.name : "Image attachment");
    setInputValue("");
    setImagePreview(null);
    setDocumentPreview(null);

    const timestamp = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const userMsg = {
      id: Date.now(),
      text: userMessage,
      image: imagePreview,
      document: documentPreview,
      sender: "user",
      timestamp,
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = buildConversationHistory([...messages, userMsg]);
      const data = await authenticatedFetch(
        "http://localhost:8000/api/chat/message",
        {
          method: "POST",
          body: JSON.stringify({
            message: userMessage,
            history,
            client_context: {
              cart_items: cartItems,
              loyalty_points: loyaltyPoints,
              wishlist: [
                { name: "Wireless Earbuds", price: 1299 },
                { name: "Organic Almonds 1kg", price: 799 },
                { name: "Running Shoes", price: 2499 },
              ],
            },
          }),
        },
        navigate
      );

      const responseText = data.response || data.message || "No response received";
      const isOrderResponse =
        data.cards?.some((c) => c.type === "order") ||
        (responseText.includes("Product:") && responseText.includes("Order ID:"));

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: responseText,
          sender: "ai",
          isOrderResponse,
          source: data.source,
          cards: data.cards || [],
          actions: data.actions || [],
          timestamp,
        },
      ]);
    } catch (err) {
      console.error(err);
      const errorMessage = err.message || "Unable to connect to AI service.";
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: errorMessage,
          sender: "ai",
          isError: true,
          timestamp,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (action) => {
    if (action.label === "My Tickets" && action.message === "Show my tickets") {
      sendMessage(action.message);
      return;
    }
    sendMessage(action.message);
  };

  const handleCreateTicket = () => {
    setTicketModal(true);
  };

  const handleTicketSubmit = async (formData) => {
    setTicketCreating(true);
    try {
      const data = await authenticatedFetch(
        "http://localhost:8000/api/tickets",
        {
          method: "POST",
          body: JSON.stringify(formData),
        },
        navigate
      );

      const ts = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "ai",
          isTicketCard: true,
          ticket: {
            ticket_id: data.ticket_id,
            subject: formData.subject,
            category: formData.category,
            priority: formData.priority,
            status: "Open",
            description: formData.description,
          },
          timestamp: ts,
        },
        {
          id: Date.now() + 2,
          sender: "ai",
          text: "Your complaint has been registered successfully. A customer care executive will contact you soon.",
          timestamp: ts,
        },
      ]);

      try {
        localStorage.setItem(
          "last_ticket_created",
          JSON.stringify({ ticket_id: data.ticket_id, ts: Date.now() })
        );
      } catch (e) {
        // ignore
      }
      try {
        window.dispatchEvent(new CustomEvent("ticketCreated", { detail: { ticket_id: data.ticket_id } }));
      } catch (e) {
        // ignore
      }

      return data;
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      setTicketCreating(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setInputValue("");
    setImagePreview(null);
    setClearConfirm(false);
    try {
      localStorage.removeItem("chat_history");
    } catch (err) {
      console.error("Failed to clear chat history:", err);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-gradient-to-b from-violet-50 to-fuchsia-50">
      {/* Header */}
      <div className="border-b border-violet-100 bg-white px-6 py-6 shadow-sm">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600">
                <span className="text-xl">🤖</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">GoServe AI Assistant</h1>
                <p className="mt-1 text-xs text-slate-500">Orders, shopping & general knowledge — one smart assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-sm font-medium text-green-600">Online</span>
              <button
                onClick={() => setTicketModal(true)}
                className="rounded-2xl border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-100"
              >
                Talk to Customer Care
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          {messages.length === 0 && !loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="rounded-3xl bg-white p-8 shadow-lg text-center max-w-md">
                <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gradient-to-r from-violet-100 to-fuchsia-100 mb-4">
                  <span className="text-3xl">🤖</span>
                </div>
                <h2 className="text-xl font-semibold text-slate-900">Hi there! 👋</h2>
                <p className="mt-2 text-sm text-slate-600 mb-6">
                  One intelligent assistant for your orders, shopping, and anything else — just ask naturally.
                </p>
                <QuickActions onSelect={handleQuickAction} />
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div key={msg.id} className="space-y-2">
                  {msg.sender === "user" ? (
                    <div className="flex justify-end">
                      <div className="max-w-xs rounded-3xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-4 shadow-md text-white">
                        {msg.text && <p className="text-sm">{msg.text}</p>}
                        {msg.audioUrl && (
                          <audio
                            controls
                            src={msg.audioUrl}
                            className="mt-3 w-full rounded-3xl bg-white"
                          />
                        )}
                        {msg.image && (
                          <img
                            src={msg.image}
                            alt="attachment"
                            className="mt-3 max-h-72 w-full rounded-3xl object-cover"
                          />
                        )}
                        <p className="mt-2 text-right text-xs text-white/70">{msg.timestamp}</p>
                      </div>
                    </div>
                  ) : msg.isError ? (
                    <div className="flex justify-start">
                      <div className="max-w-md rounded-3xl bg-red-50 px-6 py-4 shadow-md border border-red-100">
                        <p className="text-sm text-red-700">{msg.text}</p>
                        <p className="mt-2 text-xs text-red-600">{msg.timestamp}</p>
                      </div>
                    </div>
                  ) : msg.isTicketCard ? (
                    <div className="flex justify-start">
                      <div className="max-w-md">
                        <div className="rounded-3xl bg-gradient-to-br from-violet-50 to-fuchsia-50 p-6 shadow-lg border border-violet-100">
                          <div className="text-slate-900">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="text-3xl">✅</div>
                              <div>
                                <h4 className="font-bold">Support Ticket Created</h4>
                                <p className="text-xs text-slate-500">Ticket ID: {msg.ticket.ticket_id}</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-4">
                              <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Subject</p>
                                <p className="mt-1 text-sm font-medium text-slate-900">{msg.ticket.subject}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Category</p>
                                <p className="mt-1 text-sm font-medium text-slate-900">{msg.ticket.category}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Priority</p>
                                <p className="mt-1 text-sm font-medium text-slate-900">{msg.ticket.priority}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</p>
                                <p className="mt-1 text-sm font-medium text-orange-700">🟠 {msg.ticket.status}</p>
                              </div>
                            </div>

                            <div className="mb-4 text-sm text-slate-700">{msg.ticket.description}</div>

                            <div className="flex gap-2">
                              <button
                                onClick={() => navigate(`/tickets/${msg.ticket.ticket_id}`)}
                                className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                              >
                                📄 View Ticket
                              </button>
                              <button
                                onClick={() => navigate('/tickets')}
                                className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                              >
                                📋 My Tickets
                              </button>
                              <button
                                onClick={() => setInputValue('')}
                                className="flex-1 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-sm font-semibold text-white hover:shadow-lg"
                              >
                                💬 Continue Chat
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : msg.isOrderResponse && !msg.cards?.length ? (
                    <OrderCard response={msg.text} onCreateTicket={handleCreateTicket} />
                  ) : (
                    <AIResponseCard
                      response={msg.text}
                      source={msg.source}
                      cards={msg.cards}
                      actions={msg.actions}
                      onCreateTicket={handleCreateTicket}
                      onAction={handleActionClick}
                    />
                  )}
                </div>
              ))}
              {loading && (
                <>
                  <TypingIndicator />
                  <div ref={messagesEndRef} />
                </>
              )}
              {!loading && messages.length > 0 && <div ref={messagesEndRef} />}
            </>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-violet-100 bg-white p-6 shadow-lg">
        <div className="mx-auto max-w-4xl">
          {messages.length > 0 && (
            <div className="mb-4 overflow-x-auto">
              <div className="flex gap-2 pb-1">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => handleQuickAction(action)}
                    disabled={loading}
                    className="shrink-0 rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 text-[11px] font-medium text-violet-700 transition hover:bg-violet-100 disabled:opacity-50"
                  >
                    {action.emoji} {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              onClick={() => setClearConfirm(true)}
              className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
            >
              <TrashIcon className="h-4 w-4" />
              Clear
            </button>
            {imagePreview && (
              <div className="flex flex-1 flex-col gap-3 rounded-3xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-slate-700">
                {imagePreview && (
                  <div className="flex items-center gap-2">
                    <img src={imagePreview} alt="preview" className="h-8 w-8 rounded-lg object-cover" />
                    <span className="font-semibold">Image ready to send</span>
                    <button
                      onClick={() => setImagePreview(null)}
                      className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Remove
                    </button>
                  </div>
                )}
                {documentPreview && (
                  <div className="flex items-center justify-between gap-3 rounded-2xl bg-white p-3 shadow-sm border border-slate-200">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Document</p>
                      <p className="mt-1 text-sm font-medium text-slate-900">{documentPreview.name}</p>
                    </div>
                    <button
                      onClick={() => setDocumentPreview(null)}
                      className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about orders, products, or anything..."
                disabled={loading}
                className="w-full rounded-2xl border border-violet-200 bg-white px-6 py-4 text-sm placeholder-slate-400 outline-none transition-all focus:border-violet-600 focus:ring-2 focus:ring-violet-600/50 disabled:opacity-50"
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                className="hidden"
                onChange={handleImageChange}
              />
              <input
                ref={documentInputRef}
                type="file"
                accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="hidden"
                onChange={handleDocumentChange}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                type="button"
                disabled={loading}
                className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                <PhotoIcon className="h-5 w-5" />
              </button>
              <button
                onClick={openCamera}
                type="button"
                disabled={loading}
                className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                <CameraIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => documentInputRef.current?.click()}
                type="button"
                disabled={loading}
                className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                <PaperClipIcon className="h-5 w-5" />
              </button>
              <button
                onClick={sendMessage}
                disabled={loading || (!inputValue.trim() && !imagePreview && !documentPreview)}
                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white transition hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PaperAirplaneIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Clear Chat Confirmation Modal */}
      {clearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6">
          <div className="rounded-3xl bg-white p-8 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Clear Chat?</h3>
            <p className="text-sm text-slate-600 mb-6">
              This will delete all messages and attachments. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setClearConfirm(false)}
                className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={clearChat}
                className="flex-1 rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Camera Modal */}
      {cameraOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6">
          <div className="relative w-full max-w-4xl rounded-3xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900">Capture Photo</h3>
              <button
                onClick={closeCamera}
                className="text-slate-500 hover:text-slate-900"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {cameraError ? (
              <div className="rounded-3xl bg-red-50 border border-red-200 p-8 text-center mb-6">
                <div className="text-4xl mb-4">📷</div>
                <p className="text-sm text-red-700 font-semibold mb-6">{cameraError}</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setCameraError(null);
                      setCameraLoading(false);
                      setVideoReady(false);
                      openCamera();
                    }}
                    className="flex-1 rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700"
                  >
                    Retry
                  </button>
                  <button
                    onClick={closeCamera}
                    className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Live Camera */}
                <div className="rounded-3xl bg-slate-950 p-4 overflow-hidden relative flex flex-col items-center justify-center min-h-80">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    onCanPlay={() => {
                      console.log("Video can play, readyState:", videoRef.current?.readyState);
                      if (!videoReady) {
                        setVideoReady(true);
                        setCameraLoading(false);
                      }
                    }}
                    onError={(e) => {
                      console.error("Video error:", e);
                      setCameraError("Error playing video stream.");
                    }}
                    className="w-full h-full rounded-2xl object-cover"
                    style={{
                      filter: "brightness(1.2) contrast(1.1)",
                    }}
                  />
                  {cameraLoading && (
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/30">
                      <div className="h-12 w-12 rounded-full border-4 border-white border-t-violet-600 animate-spin"></div>
                      <p className="text-white text-sm font-semibold">Starting camera...</p>
                    </div>
                  )}
                </div>

                {/* Preview */}
                <div className="flex flex-col">
                  <div className="rounded-3xl bg-slate-100 p-4 flex-1 mb-4 overflow-hidden flex items-center justify-center min-h-80">
                    {cameraCaptured ? (
                      <img
                        src={cameraCaptured}
                        alt="Captured"
                        className="w-full h-full object-cover rounded-2xl cursor-pointer hover:shadow-lg transition-all"
                        onClick={() => {
                          const a = document.createElement("a");
                          a.href = cameraCaptured;
                          a.download = `photo-${Date.now()}.jpg`;
                          a.click();
                        }}
                      />
                    ) : (
                      <div className="text-center text-slate-500">
                        <div className="text-4xl mb-2">📸</div>
                        <p className="text-sm font-semibold">Preview will appear here</p>
                      </div>
                    )}
                  </div>

                  {/* Capture Controls */}
                  <div className="flex gap-3">
                    <button
                      onClick={capturePhoto}
                      disabled={!videoReady || cameraLoading}
                      className="flex-1 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-3 text-sm font-semibold text-white hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      📸 Capture
                    </button>
                    {cameraCaptured && (
                      <button
                        onClick={() => setCameraCaptured(null)}
                        className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        🔄 Retake
                      </button>
                    )}
                  </div>

                  {cameraCaptured && (
                    <button
                      onClick={sendCapturedImage}
                      className="mt-3 w-full rounded-2xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-700"
                    >
                      ✓ Use Photo
                    </button>
                  )}
                </div>
              </div>
            )}

            <canvas ref={canvasRef} className="hidden" />
          </div>
        </div>
      )}

      {/* Ticket Modal */}
      <TicketModal
        isOpen={ticketModal}
        onClose={() => setTicketModal(false)}
        onSubmit={handleTicketSubmit}
        isSubmitting={ticketCreating}
      />
    </div>
  );
}
