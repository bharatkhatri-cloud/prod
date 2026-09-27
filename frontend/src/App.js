import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { fetchToGetLoggedInUserDetails } from "./reduxStore/authentication/userAuthSlice";
import { useNavigate } from "react-router-dom";
import Login from "./assets/Login";
import DashboardSkeleton from "./components/DashboardSkeleton.jsx";
import Admin from "./modules/Admin/Admin";
import NavigateInJamPreparation from "./modules/JamPreparation/NavigateInJamPreparation";
import NavigateInLcPreparation from "./modules/LcPreparation/NavigateInLcPreparation";
import NavigateInLcRejection from "./modules/LcRejection/NavigateInLcRejection";
import NavigateInBagInoculation from "./modules/BagInoculation/NavigateInBagInoculation";
import NavigateInBagStoreRoom from "./modules/BagStoreRoom/NavigateInBagStoreRoom";
import NavigateInMouldFilling from "./modules/MouldFilling/NavigateInMouldFilling";
import NavigateInDeMoulding from "./modules/DeMouldingPieces/NavigateInDeMoulding.jsx";
import NavigateInOvenIn from "./modules/OvenIn/NavigateInOvenIn";
import NavigateInOvenOut from "./modules/OvenOut/NavigateInOvenOut";
import NavigateInMouldRejection from "./modules/MouldRejection/NavigateInMouldRejection.jsx";
import NavigateInQrCodeGeneration from "./modules/QrCodeGeneration/NavigateInQrCodeGeneration.jsx";
import NavigateGrowthChamber from "./modules/Humidifier/NavigateGrowthChamber";

// Import notification actions and toast popups.
import { addNotification, fetchNotifications } from "./reduxStore/Notifications/NotificationsSlice";
import { toast } from "react-toastify";
// We import the STOMP Client to communicate with Spring's message broker.
import { Client } from "@stomp/stompjs";

function App() {
  const state = useSelector((state) => state.userAuthReducer);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // NEW: Loading state

  // Get user details on startup.
  useEffect(() => {
    const fetchUserDetails = async () => {
      setIsLoading(true);
      await dispatch(fetchToGetLoggedInUserDetails());
      setIsLoading(false);
    };

    fetchUserDetails();
  }, [dispatch]);

  // Check if user is logged in. If yes, save their role.
  useEffect(() => {
    if (state.user?.dhaDbTkn) {
      setIsLoggedIn(true);
      setUserRole(state.user?.loggedInUser?.role);
    } else {
      setIsLoggedIn(false);
      setUserRole(null);
    }
  }, [state.user]);

  // This hook connects the browser to the live notification WebSocket when logged in.
  useEffect(() => {
    let stompClient = null;

    if (isLoggedIn && state.user?.dhaDbTkn) {
      // Fetch initial notifications list.
      dispatch(fetchNotifications({ page: 1, limit: 10 }));

      const connectStomp = () => {
        // Find backend host and change "http" to "ws" protocol.
        const backendHost = process.env.REACT_APP_BACKEND_PORT_AND_HOST || "http://localhost:8080/";
        const wsHost = backendHost.replace(/^http/, "ws") + "ws/notifications";

        // Setup our STOMP protocol client.
        stompClient = new Client({
          brokerURL: wsHost,
          connectHeaders: {
            token: state.user.dhaDbTkn
          },
          // Try to reconnect every 5 seconds if connection fails.
          reconnectDelay: 5000,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
        });

        // When STOMP is successfully connected:
        stompClient.onConnect = (frame) => {
          console.log("STOMP connection established");
          
          // Subscribe to user-targeted private channel.
          stompClient.subscribe("/user/queue/notifications", (message) => {
            if (message.body) {
              try {
                const payload = JSON.parse(message.body);
                // Save the incoming notification to our Redux slice.
                dispatch(addNotification(payload));

                // Pop up a toast alert.
                toast.info(
                  <div>
                    <strong className="text-sm font-extrabold">{payload.title}</strong>
                    <p className="text-xs mt-1 leading-normal font-medium">{payload.message}</p>
                  </div>,
                  {
                    icon: "🔔",
                    autoClose: 6000,
                  }
                );
              } catch (err) {
                console.error("Failed to parse STOMP notification:", err);
              }
            }
          });
        };

        stompClient.onStompError = (frame) => {
          console.error("STOMP protocol error:", frame.headers['message']);
          console.error("STOMP error details:", frame.body);
        };

        // Activate the connection.
        stompClient.activate();
      };

      connectStomp();
    }

    // Cleanup: disconnect stomp client when user logs out or leaves.
    return () => {
      if (stompClient) {
        stompClient.deactivate();
      }
    };
  }, [isLoggedIn, state.user, dispatch]);

  const renderRoutes = () => {
    if (isLoading) return <DashboardSkeleton />; // Show skeleton while loading

    switch (userRole) {
      case "Admin":
        return <Admin />;
      case "Supervisor (Jam Preparation)":
        return <NavigateInJamPreparation />;
      case "Supervisor (LC Preparation)":
        return <NavigateInLcPreparation />;
      case "Supervisor (LC Rejection)":
        return <NavigateInLcRejection />;
      case "Supervisor (Bag Inoculation)":
        return <NavigateInBagInoculation />;
      case "Supervisor (Bag Incubation)":
        return <NavigateInBagStoreRoom />;
      case "Supervisor (Mould Filling)":
        return <NavigateInMouldFilling />;
      case "QR Code Generator":
        return <NavigateInQrCodeGeneration />;
      case "Supervisor (Mould Rejection)":
        return <NavigateInMouldRejection />;
      case "Supervisor (De-Moulding)":
        return <NavigateInDeMoulding />;
      case "Supervisor (Growth Chamber)":
        return <NavigateGrowthChamber />;
      case "Supervisor (Oven In)":
        return <NavigateInOvenIn />;
      case "Supervisor (Oven Out)":
        return <NavigateInOvenOut />;
      default:
        return <DashboardSkeleton />;
    }
  };

  const loggedIn = async (dhaDbTkn, enteredRole) => {
    setIsLoggedIn(true);
    setUserRole(enteredRole);
    await dispatch(fetchToGetLoggedInUserDetails());
    navigate("/"); // Redirect after login
  };

  return (
    <>
      {isLoading ? <DashboardSkeleton /> : isLoggedIn ? renderRoutes() : <Login loggedIn={loggedIn} />}
    </>
  );
}

export default App;
