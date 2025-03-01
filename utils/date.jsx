import React from "react";
export const Formateddate = () => {
    return new Date().toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "2-digit"
      });
  
}


