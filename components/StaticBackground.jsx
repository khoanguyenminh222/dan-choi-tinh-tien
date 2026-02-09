import React from "react";
import BlossomBranch from "./BlossomBranch";
import GoldCoin from "./GoldCoin";
import RedEnvelope from "./RedEnvelope";

const StaticBackground = React.memo(() => (
  <>
    {/* Main Decorative Branches */}
    <BlossomBranch
      type="peach"
      style={{
        position: "absolute",
        top: -30,
        right: -40,
        zIndex: 0,
        transform: [{ scale: 1.5 }, { rotate: "-15deg" }],
      }}
    />
    <BlossomBranch
      type="apricot"
      style={{
        position: "absolute",
        top: "40%",
        left: -50,
        zIndex: 0,
        transform: [{ scale: 1.2 }, { rotate: "160deg" }],
      }}
    />

    {/* Central Background Branches (Low Opacity) */}
    <BlossomBranch
      type="peach"
      style={{
        position: "absolute",
        top: "25%",
        right: "15%",
        zIndex: 0,
        opacity: 0.15,
        transform: [{ scale: 1.8 }, { rotate: "10deg" }],
      }}
    />
    <BlossomBranch
      type="apricot"
      style={{
        position: "absolute",
        bottom: "30%",
        left: "10%",
        zIndex: 0,
        opacity: 0.15,
        transform: [{ scale: 1.6 }, { rotate: "-150deg" }],
      }}
    />

    <BlossomBranch
      type="peach"
      style={{
        position: "absolute",
        bottom: -20,
        right: -30,
        zIndex: 0,
        transform: [{ scale: 1.3 }, { rotate: "190deg" }],
      }}
    />

    {/* Floating Subtle Elements */}
    <GoldCoin
      size={35}
      style={{
        position: "absolute",
        top: 120,
        left: 30,
        opacity: 0.12,
        transform: [{ rotate: "15deg" }],
      }}
    />
    <GoldCoin
      size={25}
      style={{
        position: "absolute",
        bottom: 250,
        right: 40,
        opacity: 0.1,
        transform: [{ rotate: "-20deg" }],
      }}
    />
    <RedEnvelope
      size={40}
      style={{
        position: "absolute",
        top: "65%",
        left: 20,
        opacity: 0.08,
        transform: [{ rotate: "-10deg" }],
      }}
    />
    <RedEnvelope
      size={30}
      style={{
        position: "absolute",
        top: 200,
        right: 30,
        opacity: 0.06,
        transform: [{ rotate: "25deg" }],
      }}
    />
  </>
));

export default StaticBackground;
