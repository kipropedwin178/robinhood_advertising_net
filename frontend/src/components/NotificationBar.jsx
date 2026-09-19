import { useEffect, useState } from "react";

import "./NotificationBar.css";


function NotificationBar({
  notification,
  onClose
}) {

  const [progress, setProgress] = useState(100);

  useEffect(() => {

    if (!notification) {
      return;
    }

    setProgress(100);

    const duration = 2500;
    const intervalTime = 25;

    const step =
      100 /
      (duration / intervalTime);

    const interval = setInterval(() => {

      setProgress(previous => {

        const next =
          previous - step;

        if (next <= 0) {
          clearInterval(interval);
          return 0;
        }

        return next;

      });

    }, intervalTime);


    const timeout = setTimeout(() => {

      onClose();

    }, duration);


    return () => {

      clearInterval(interval);
      clearTimeout(timeout);

    };

  }, [notification, onClose]);


  if (!notification) {
    return null;
  }


  const notificationClass =
    `notification-bar ${notification.type || "info"}`;


  return (
    <div className={notificationClass}>

      <div className="notification-content">

        <div className="notification-icon">

          {notification.type === "success" && "✓"}

          {notification.type === "error" && "!"}

          {notification.type === "warning" && "⚠"}

          {(!notification.type ||
            notification.type === "info") && "i"}

        </div>


        <div className="notification-message">

          <span>
            {notification.message}
          </span>

        </div>


        <button
          type="button"
          className="notification-close"
          onClick={onClose}
          aria-label="Close notification"
        >
          ×
        </button>

      </div>


      <div className="notification-progress-track">

        <div
          className="notification-progress"
          style={{
            width: `${progress}%`
          }}
        />

      </div>

    </div>
  );
}


export default NotificationBar;