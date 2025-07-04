import React, { useState, useEffect } from "react";
import { BrowserProvider, Contract, parseEther, formatEther } from "ethers";
import RedeemForm from "./RedeemForm";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";






const CONTRACT_ADDRESS = "0xa6A846f7C9d98709CE24430B59319a5A7F9ecD92";

const ABI = [
  "function mint(uint256 id, uint256 amount) payable",
  "function tokenSupply(uint256 id) view returns (uint256)",
  "function balanceOf(address account, uint256 id) view returns (uint256)",
  "function tokenPrice(uint256 id) view returns (uint256)",
  "function phaseActive(uint256) view returns (bool)",   // <--- questa mancava
  "function burn(address account, uint256 id, uint256 amount)"
];

const priceEth = 0.095;
const tokenId = 0;
const maxSupply = 500;

const keyframes = `
@keyframes glow {
  0%, 100% {
    box-shadow: 0 0 8px 3px #00ffcc88;
  }
  50% {
    box-shadow: 0 0 25px 10px #00ffd688;
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
`;

function MintPage({ onMint, minting, error, success, walletConnected, connectWallet }) {
  const [currentPhaseId, setCurrentPhaseId] = useState(0);
  const [mintedCount, setMintedCount] = useState(0);
  const [hasDiscount, setHasDiscount] = useState(false);
  const [mintAmount, setMintAmount] = useState(1);
  const [basePrice, setBasePrice] = useState(0);
  const [isPhaseActive, setIsPhaseActive] = useState(true);

  const PHASES = [
    { id: 0, label: "Phase 0", image: "/images/0.png", maxSupply: 500 },
    { id: 1, label: "Phase 1", image: "/images/1.png", maxSupply: 500 },
    { id: 2, label: "Phase 2", image: "/images/2.png", maxSupply: 500 }
  ];

  const currentPhase = PHASES[currentPhaseId];

  useEffect(() => {
    async function fetchMintData() {
      try {
        const provider = new BrowserProvider(window.ethereum);
        const contract = new Contract(CONTRACT_ADDRESS, ABI, provider);

        const price = await contract.tokenPrice(currentPhase.id);
        const formatted = parseFloat(formatEther(price));
        setBasePrice(formatted);
const minted = await contract.tokenSupply(currentPhase.id);
setMintedCount(Number(minted));


        const phaseStatus = await contract.phaseActive(currentPhase.id);
        setIsPhaseActive(phaseStatus);

        if (walletConnected && currentPhase.id > 0) {
          const signer = await provider.getSigner();
          const userAddress = await signer.getAddress();
          const prevBalance = await contract.balanceOf(userAddress, currentPhase.id - 1);
          setHasDiscount(prevBalance > 0);
        } else {
          setHasDiscount(false);
        }
      } catch (err) {
        console.error("Errore durante il fetch dei dati:", err);
      }
    }

    fetchMintData();
  }, [currentPhaseId, walletConnected, currentPhase.id]);

  const pricePerNFT = hasDiscount ? basePrice * 0.9 : basePrice;
  const totalPrice = (pricePerNFT * mintAmount).toFixed(4);

  return (
    <div style={{ padding: "2rem", maxWidth: 900, margin: "0 auto", color: "#fff" }}>
      <h1 style={{ fontSize: "2.5rem", textAlign: "center", marginBottom: "2rem" }}>Mint David's Phases</h1>

      <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginBottom: "2rem" }}>
        {PHASES.map((phase) => (
          <button
            key={phase.id}
            onClick={() => setCurrentPhaseId(phase.id)}
            disabled={minting}
            style={{
              padding: "0.8rem 1.5rem",
              borderRadius: "10px",
              backgroundColor: currentPhaseId === phase.id ? "#0ff" : "#222",
              color: currentPhaseId === phase.id ? "#000" : "#fff",
              border: "1px solid #0ff",
              cursor: "pointer",
              transition: "all 0.3s ease"
            }}
          >
            {phase.label}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "2rem", marginBottom: "2rem" }}>
        <div style={{ width: "400px", backgroundColor: "#111", padding: "1rem", borderRadius: "12px", border: "1px solid #333" }}>
          <img
            src={currentPhase.image}
            alt={currentPhase.label}
            style={{ width: "100%", borderRadius: "8px", display: "block" }}
          />
          <p style={{ fontSize: "1rem", textAlign: "center", marginTop: "0.5rem", color: "#ccc" }}>
            {mintedCount} / {currentPhase.maxSupply} already minted 
          </p>
        </div>

        <div style={{ width: "400px", backgroundColor: "#111", padding: "1rem", borderRadius: "12px", border: "1px solid #333" }}>
          <h3 style={{ marginBottom: "1rem", fontSize: "1.4rem", color: "#0ff", textAlign: "center" }}>
            Owner Benefits
          </h3>
        <ul style={{ lineHeight: "1.6", fontSize: "1rem", color: "#ccc", paddingLeft: "1rem", listStyleType: "none" }}>
  <li>✅ Become part of the Tuscanium artistic vision and collector community</li>
  <li>
    ✅ Guaranteed{" "}
    <span style={{ color: "lime", fontWeight: "bold" }}>
      extra airdrops
    </span>{" "}
    of value that you can even insta-flip for <b>every holder</b>
  </li>
  <li>✅ 10% discount on next mint phases</li>
  <li>
    ✅{" "}
    <span style={{ color: "lime", fontWeight: "bold" }}>
      FREE CANVAS
    </span>{" "}
    delivered at home for Phase 1 buyers 🎁
  </li>
  <li>
    ✅ <b>Premium</b> Holder role on Discord with access to private channels, early news, and special benefits
  </li>
  <li>
    ✅{" "}
    <span style={{ color: "lime", fontWeight: "bold" }}>
      Extra rewards
    </span>{" "}
    and more discounts for those holding <b>all 3 phases</b>
  </li>
</ul>

        </div>
      </div>

      <div style={{ margin: "2rem 0", textAlign: "center" }}>
        <p style={{ fontSize: "1rem" }}>
          {walletConnected ? (
            isPhaseActive ? (
              <>Base price: <b>{basePrice} ETH</b></>
            ) : (
              <span style={{ color: "#ff4444", fontWeight: "bold" }}>Phase not active yet</span>
            )
          ) : (
            <>Base price: <b>0.095 ETH</b></>
          )}
        </p>

        {walletConnected && hasDiscount && (
          <p style={{ marginTop: "0.8rem", fontSize: "1.2rem", fontWeight: "bold" }}>
            <span style={{ textDecoration: "line-through", color: "#bbb", marginRight: "1rem" }}>
              {basePrice.toFixed(4)} ETH
            </span>
            <span style={{ color: "#00ff99" }}>
              {pricePerNFT.toFixed(4)} ETH
            </span>
            <span style={{ color: "#888", marginLeft: "0.6rem", fontSize: "1rem", fontWeight: "normal" }}>
              (Holders price: 10% off)
            </span>
          </p>
        )}

        <p>
          Total: <b>{walletConnected ? `${totalPrice} ETH` : "Connect wallet to see total"}</b> for {mintAmount} NFT(s)
        </p>

        <label htmlFor="mintAmount" style={{ marginRight: "1rem", fontSize: "1.1rem" }}>Quantity:</label>
        <input
          id="mintAmount"
          type="number"
          min={1}
          max={10}
          value={mintAmount}
          onChange={(e) => setMintAmount(Math.min(10, Math.max(1, Number(e.target.value))))}
          disabled={minting || !isPhaseActive}
          style={{
            width: "60px",
            padding: "0.4rem",
            fontSize: "1.1rem",
            borderRadius: "6px",
            textAlign: "center",
            backgroundColor: "#111",
            color: "#fff",
            border: "1px solid #444",
            marginBottom: "1rem"
          }}
        />

        <div style={{ marginTop: "1rem", textAlign: "center" }}>
  <button
    onClick={() => onMint(currentPhase.id, mintAmount)}
    disabled={minting}
    style={{
      padding: "1rem 3rem",
      fontSize: "1.2rem",
      border: "none",
      borderRadius: "10px",
      backgroundColor: "#0ff",
      color: "#000",
      fontWeight: "bold",
      cursor: "pointer"
    }}
  >
    {minting ? "Minting..." : "MINT NOW"}
  </button>
</div>

<div style={{ marginTop: "1rem", textAlign: "center" }}>
  <a
    href="https://opensea.io/collection/david-s-phases-by-tuscanium"
    target="_blank"
    rel="noopener noreferrer"
    style={{
      color: "#0ff",
      textDecoration: "underline",
      fontSize: "1.1rem",
      fontWeight: "bold"
    }}
  >
    View on OpenSea
  </a>
</div>

      </div>

      {error && <p style={{ color: "red", marginTop: "1rem", textAlign: "center" }}>{error}</p>}
      {success && <p style={{ color: "lightgreen", marginTop: "1rem", textAlign: "center" }}>{success}</p>}
    </div>
  );
}

function AboutUs() {
  return (
    <div
      style={{
        animation: "fadeIn 0.8s ease-in-out",
        padding: "3rem 2rem",
        maxWidth: 900,
        margin: "0 auto",
        color: "#fff",
        fontFamily: "'Poppins', sans-serif",
        fontSize: "1.15rem",
        lineHeight: "1.8",
      }}
    >
<h1 style={{ marginBottom: "1.5rem", textAlign: "center" }}>About Tuscanium</h1>

      {/* Intro testo pieno */}
      <p style={{ marginBottom: "1.5rem" }}>
        Tuscanium is more than an NFT project, it is an emerging brand dedicated to connecting Italian artistic heritage with global innovation. We see art as a transformative force that unites creativity, technology, and culture, shaping new ways to create and share value.
      </p>

      {/* Foto + testo accanto */}
      <div
        style={{
          display: "flex",
          gap: "2rem",
          alignItems: "center",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
        }}
      >
        <img
          src="/images/art1.png"
          alt="Tuscan landscape and art"
          style={{
            width: "100%",
            maxWidth: "380px",
            height: "auto",
            borderRadius: "12px",
            boxShadow: "0 0 15px #0ff8",
            objectFit: "cover",
            flex: "0 0 auto",
          }}
        />
        <p style={{ flex: "1 1 300px", minWidth: 260 }}>
          Our mission is to build a distinctive presence across multiple dimensions: digital art collections, blockchain investments, and exclusive physical products that celebrate authentic local traditions. From rare NFTs to tangible artworks and curated Tuscan creations, Tuscanium aspires to set a new standard for how people collect, invest, and experience beauty.
        </p>
      </div>

      {/* Testi pieni sotto */}
      <p style={{ marginBottom: "1.5rem" }}>
        We envision a brand that transcends boundaries, combining the emotional impact of art with the transparency of decentralized technology and the richness of real-world craftsmanship. Becoming part of Tuscanium means joining a community driven by trust, ambition, and the desire to build something lasting and meaningful.
      </p>

      <img
  src="/images/products.png"
  alt="Tuscanium Products"
  style={{
    width: "100%",
    maxWidth: "500px",
    display: "block",
    margin: "2rem auto",
    borderRadius: "12px",
    boxShadow: "0 0 15px #0ff8",
  }}
/>

<p style={{ marginBottom: "1.5rem" }}>
  Together, we are shaping a journey that connects past and future, local culture and global perspectives — and positions Tuscanium as a powerful reference point in the evolving world of art, crypto, and beyond.
</p>


      <p style={{ marginTop: "2rem", fontWeight: "600", fontSize: "1.3rem" }}>
        Welcome to Tuscanium. Welcome to your transformation.
      </p>
    </div>
  );
}



function Roadmap() {
  return (
    <div
      style={{
        padding: "2rem",
        maxWidth: "1000px",
        margin: "0 auto",
        color: "#fff",
        fontFamily: "Poppins, sans-serif",
        overflowX: "hidden",
      }}
    >
      <h1 style={{ textAlign: "center", fontSize: "2.5rem", marginBottom: "2rem" }}>Roadmap</h1>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "3rem",
          position: "relative",
          paddingLeft: "2rem",
          borderLeft: "4px solid #0ff",
        }}
      >
        {[
          {
            title: "Phase 0 - July 3, 2025",
            text: "Launch of the David’s Phases collection - Phase 0",
            image: "/images/0.png",
          },
          {
            title: "Phase 1 - August 3, 2025",
            text: "Phase 1",
            image: "/images/1.png",
          },
          {
            title: "Phase 2 - September 3, 2025",
            text: "Phase 2",
            image: "/images/2.png",
          },
          {
            title: "Second Collection - October/November 2025",
            text: "Launch of the second Tuscanium collection",
            image:  "/images/drappo.png", 
          },
          {
            title: " Entry into the International Art scene - 2026",
            text: "Debut into the international art world as a recognized force with an artistic value",
            image: "/images/davidmuseo.png", 
          },
          {
            title: "Tuscanium Coin- 2026",
            text: "Launch of the Tuscanium coin",
            image: "/images/coin.png",
          },
          {
            title: "Physical Products - 2026",
            text: "Launch of exclusive physical Tuscanium products",
            image: "/images/products.png",
          },
           {
            title: "News for project Supporters- 2026",
            text: "News beneftis and rewards for holders",
            image: "/images/holders.png",
          },
        ].map((item, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "2rem",
              position: "relative",
              animation: "fadeIn 0.8s ease-in-out",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: "-1.15rem",
                width: "20px",
                height: "20px",
                backgroundColor: "#0ff",
                borderRadius: "50%",
                border: "3px solid #000",
              }}
            />
            {item.image && (
              <img
                src={item.image}
                alt={item.title}
                style={{
                  width: "160px",
                  height: "160px",
                  objectFit: "cover",
                  borderRadius: "12px",
                  boxShadow: "0 0 10px #0ff8",
                  flexShrink: 0,
                }}
              />
            )}
            <div>
              <h2 style={{ marginBottom: "0.5rem", fontSize: "1.5rem", color: "#0ff" }}>{item.title}</h2>
              <p style={{ fontSize: "1.1rem", lineHeight: "1.5" }}>{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// === Our Collections component ===
function OurCollections() {
return (
  <div
    style={{
      animation: "fadeIn 0.8s ease-in-out",
      padding: "3rem 2rem",
      maxWidth: 900,
      margin: "0 auto",
      color: "#fff",
      fontFamily: "'Poppins', sans-serif",
      fontSize: "1.15rem",
      lineHeight: "1.8",
      textAlign: "center",
    }}
  >
    <h1 style={{ marginBottom: "1.5rem" }}>David's Phases</h1>
    <img
      src="/images/1.png"
      alt="Our Collection"
      style={{
        width: "400px",
        maxWidth: "90vw",
        borderRadius: "12px",
        marginBottom: "1rem",
      }}
    />
    <p style={{ marginBottom: "2rem" }}>
      Inspired by Michelangelo’s David, each NFT in this collection ignites the
      marble skin in vibrant flames, capturing a metamorphic journey of courage
      and rebirth. Watch as David’s phases transform, his surface glowing with
      the power to overcome giants and emerge anew.
   <p>
  Additionally, by purchasing Phase 1, you will receive a{" "}
  <span style={{ color: "lime", fontWeight: "bold" }}>
    free canvas
  </span>{" "}
  shipped directly to your home at no cost.
</p>

    </p>

    {/* Prima e Dopo */}
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "1rem",
        flexWrap: "wrap",
        marginBottom: "2rem",
      }}
    >
      <img
        src="/images/davidoriginale.png"
        alt="David Before"
        style={{
          width: "180px",
          borderRadius: "10px",
          objectFit: "cover",
        }}
      />
      <span style={{ fontSize: "2rem", color: "#0ff" }}>➡️</span>
      <img
        src="/images/2.png"
        alt="David After"
        style={{
          width: "180px",
          borderRadius: "10px",
          objectFit: "cover",
        }}
      />
    </div>

    {/* Link in fondo */}
    <a
      href="https://opensea.io/collection/david-s-phases-by-tuscanium"
      target="_blank"
      rel="noopener noreferrer"
      style={{
        color: "#0ff",
        textDecoration: "underline",
        fontWeight: "bold",
        fontSize: "1.2rem",
        display: "inline-block",
        marginTop: "1rem",
      }}
    >
      View on OpenSea
    </a>
  </div>
);

}

function HowToBuy() {
  const steps = [
    {
      title: "1. Install MetaMask",
      text: "Download and install the MetaMask browser extension from metamask.io. Create a new wallet or import an existing one.",
    },
    {
      title: "2. Fund Your Wallet",
      text: "Transfer ETH to your MetaMask wallet from an exchange like Coinbase, Binance, or Bitstamp. Otherwise you can directly by crypto with your credit card directly on Metamask.",
    },
    {
      title: "3. Connect Your Wallet",
      text: "Click the 'Connect Wallet' button on the top right of this site to link MetaMask to Tuscanium.",
    },
    {
      title: "4. Mint Your NFT",
      text: "Go to the 'Mint' section, choose how many NFTs you want, and confirm the transaction in MetaMask.",
    },
    {
      title: "5. View on OpenSea",
      text: "After minting, you can view your NFT in your wallet or on OpenSea.",
    },
  ];

  return (
    <div style={{ padding: "3rem 2rem", maxWidth: 900, margin: "0 auto", color: "#fff" }}>
      <h1 style={{ marginBottom: "2rem", textAlign: "center" }}>How to Buy</h1>
      {steps.map((step, i) => (
        <div key={i} style={{ marginBottom: "1.8rem" }}>
          <h2 style={{ color: "#0ff", marginBottom: "0.5rem" }}>{step.title}</h2>
          <p style={{ fontSize: "1.1rem", lineHeight: "1.6" }}>{step.text}</p>
        </div>
      ))}
    </div>
  );
}

function RedeemCanvas({
  burnVoucher,
  burning,
  burnError,
  burnSuccess,
  walletConnected,
  burnTxHash,
  purchaseTxHash,
    walletAddress,
  buyCanvas 
}) {
  return (
    <div
      style={{
        padding: "2rem",
        maxWidth: "900px",
        margin: "0 auto",
        color: "#fff",
        fontFamily: "'Poppins', sans-serif",
        marginTop: "3rem",
      }}
    >
      <h1 style={{ textAlign: "center", fontSize: "2rem", marginBottom: "1.5rem" }}>
        🎁 Redeem Your Canvas
      </h1>
      <p
        style={{
          textAlign: "center",
          fontSize: "1.1rem",
          marginBottom: "2rem",
          color: "#ccc",
        }}
      >
        By minting Phase 1, you received a special voucher NFT. Burn it here or pay directly to unlock the form to request your exclusive canvas painting delivered to your home.
      </p>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "1.5rem",
          marginBottom: "2rem",
          flexWrap: "wrap",
        }}
      >
        {/* Voucher Image */}
        <img
          src="/images/6.png"
          alt="Voucher NFT"
          style={{
            width: "200px",
            height: "auto",
            borderRadius: "12px",
            boxShadow: "0 0 10px rgba(0,255,255,0.3)",
          }}
        />

        {/* Arrow + flame */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <span style={{ fontSize: "2rem", color: "lime" }}>➡️</span>
          <span style={{ fontSize: "1.5rem" }}>🔥</span>
        </div>

        {/* Tela Image */}
        <img
          src="/images/tela.png"
          alt="Canvas"
          style={{
            width: "200px",
            height: "auto",
            borderRadius: "12px",
            boxShadow: "0 0 10px rgba(0,255,255,0.3)",
          }}
        />
      </div>

      <div style={{ textAlign: "center" }}>
        {/* Button Burn */}
        <button
          onClick={burnVoucher}
          disabled={burning || !walletConnected}
          style={{
            padding: "1rem 2rem",
            fontSize: "1.2rem",
            border: "none",
            borderRadius: "8px",
            backgroundColor: burning ? "#888" : "#0ff",
            color: "#000",
            fontWeight: "bold",
            cursor: burning || !walletConnected ? "not-allowed" : "pointer",
            transition: "background 0.3s ease",
          }}
        >
          {burning ? "Burning..." : "🔥 Burn Voucher"}
        </button>

        <p style={{ margin: "1rem 0", fontSize: "1.2rem", fontWeight: "bold", color: "#999" }}>
          OR
        </p>

        {/* Button Buy */}
        <div style={{ marginBottom: "1rem" }}>
          <button
            onClick={buyCanvas}
            disabled={burning || !walletConnected}
            style={{
              padding: "1rem 2rem",
              fontSize: "1.2rem",
              border: "none",
              borderRadius: "8px",
              backgroundColor: burning ? "#888" : "#ff9900",
              color: "#000",
              fontWeight: "bold",
              cursor: burning || !walletConnected ? "not-allowed" : "pointer",
              transition: "background 0.3s ease",
            }}
          >
            {burning ? "Processing..." : "💰 Buy Now - 0.049 ETH"}
          </button>
        </div>

      <p
  style={{
    marginTop: "0.5rem",
    fontSize: "0.95rem",
    color: "lime",
    fontWeight: "bold",
  }}
>
  The form for address and details will appear after the transaction is confirmed.
</p>

<div style={{ marginTop: "2rem", textAlign: "center" }}>
  <img
    src="/images/tela.png"
    alt="Your Exclusive Canvas"
    style={{
      width: "400px",
      maxWidth: "90vw",
      borderRadius: "12px",
      boxShadow: "0 0 15px rgba(0,255,255,0.4)",
    }}
  />
</div>


        {/* Show RedeemForm if one of the two transactions is confirmed */}
        {(walletAddress && (burnTxHash || purchaseTxHash)) && (
          <RedeemForm
            burnTxHash={burnTxHash || purchaseTxHash}
            walletAddress={walletAddress}
          />
        )}

        {burnError && (
          <p style={{ color: "red", marginTop: "1rem" }}>{burnError}</p>
        )}
        {burnSuccess && (
          <p style={{ color: "lightgreen", marginTop: "1rem" }}>{burnSuccess}</p>
        )}
      </div>
    </div>
  );
}

function isMobileDevice() {
  return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}


export default function App() {
  const [minting, setMinting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [page, setPage] = useState("mint");
  const [walletConnected, setWalletConnected] = useState(false);
  const [burning, setBurning] = useState(false);
const [burnError, setBurnError] = useState("");
const [burnSuccess, setBurnSuccess] = useState("");
const [walletAddress, setWalletAddress] = useState(null);
const [burnTxHash, setBurnTxHash] = useState(null);
const [purchaseTxHash, setPurchaseTxHash] = useState(null);
const [menuOpen, setMenuOpen] = useState(false);
const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

useEffect(() => {
  const handleResize = () => setIsMobile(window.innerWidth <= 768);
  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);

useEffect(() => {
  if (!isMobile) return; // Non fare nulla su desktop

  function handleScroll() {
    const footer = document.querySelector("footer");
    const button = document.querySelector('a[href*="metamask"]');
    if (!footer || !button) return;

    const footerRect = footer.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    if (footerRect.top < windowHeight) {
      // Se il footer è visibile nella viewport, solleva il bottone
      const overlap = windowHeight - footerRect.top + 16; // 16px margine
      button.style.bottom = `${overlap}px`;
    } else {
      // Se il footer non è visibile, resta in basso
      button.style.bottom = "1rem";
    }
  }

  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, [isMobile]);

async function burnVoucher() {
  if (!window.ethereum) {
    setBurnError("Please install MetaMask to burn your voucher.");
    return;
  }
  setBurning(true);
  setBurnError("");
  setBurnSuccess("");

  try {
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new Contract(CONTRACT_ADDRESS, ABI, signer);
    const userAddress = await signer.getAddress();

    // Qui tx è la transazione inviata
    const tx = await contract.burn(userAddress, 6, 1);

    console.log("Sent tx:", tx);

    // tx.hash è l'hash immediato
    setWalletAddress(userAddress);
    setBurnTxHash(tx.hash);
    console.log("burnTxHash:", tx.hash);
    console.log("walletAddress:", userAddress);

    setBurnSuccess("Voucher burned successfully! 🎉 You can now fill in the shipping form.");
  } catch (err) {
    setBurnError("Burn failed: " + (err?.info?.error?.message || err.message));
  }
  setBurning(false);
}

async function buyCanvas() {
  if (!window.ethereum) {
    setBurnError("Please install MetaMask to buy your canvas.");
    return;
  }

  setBurning(true);
  setBurnError("");
  setBurnSuccess("");

  try {
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const tx = await signer.sendTransaction({
      to: "0xe025f9cd90b99b3590c185cbf1ae5e1444148240", // Indirizzo destinatario ETH
      value: parseEther("0.049")
    });

    console.log("Buy tx:", tx);

    setWalletAddress(await signer.getAddress());
    setPurchaseTxHash(tx.hash);

    setBurnSuccess("Payment successful! 🎉 You can now fill in the shipping form.");
  } catch (err) {
    setBurnError("Payment failed: " + (err?.info?.error?.message || err.message));
  }

  setBurning(false);
}



  async function connectWallet() {
  if (!window.ethereum) {
    setError("MetaMask is not installed");
    return;
  }
  try {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    setWalletConnected(true);
  } catch (err) {
    setError("Wallet connection failed: " + err.message);
  }
}

async function mint(id, amount) {
  if (!window.ethereum) {
    setError("Please install MetaMask to mint");
    return;
  }

  setMinting(true);
  try {
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new Contract(CONTRACT_ADDRESS, ABI, signer);

    // Ottieni il balance per vedere se ha diritto allo sconto
    let hasDiscount = false;
    if (id > 0) {
      const prevBalance = await contract.balanceOf(await signer.getAddress(), id - 1);
      hasDiscount = prevBalance > 0;
    }

  const rawPrice = await contract.tokenPrice(id);
const basePrice = Number(rawPrice) / 1e18;
const finalPrice = hasDiscount ? basePrice * 0.9 : basePrice;
const totalPrice = finalPrice * amount;

const tx = await contract.mint(id, amount, {
  value: parseEther(totalPrice.toFixed(6)) // ✅ ora hai max 6 decimali
});


    await tx.wait();
    setSuccess("Mint successful! 🎉");
    setTimeout(() => setSuccess(""), 3000);
  } catch (err) {
    setError("Mint failed: " + (err?.info?.error?.message || err.message));
  }
  setMinting(false);
}

  return (
    <>
      <style>{keyframes}</style>
<style>{`
  nav button {
    font-family: 'Poppins', sans-serif;
  }
`}</style>

<style>{`
  @media (max-width: 768px) {
    main h1 {
      margin-top: 3rem !important;
      margin-bottom: 1.5rem !important;
    }
  }
`}</style>


<style>{`
  @media (max-width: 768px) {
    main h1 {
      margin-top: 3rem !important;
    }
  }
`}</style>


<style>{`
  @media (max-width: 768px) {
    img[alt="Logo"] {
      width: 50px !important;
      top: 0.5rem !important;
      right: 0.5rem !important;
    }
  }
`}</style>

<style>{`
  @media (max-width: 768px) {
    body, div, p, h1, h2, h3, li {
      font-size: 0.95rem !important;
      line-height: 1.6 !important;
    }
    main > div, main > section {
      padding: 1.2rem !important;
    }
    img {
      max-width: 100% !important;
      height: auto !important;
    }
  }
`}</style>
<style>{`
  @media (max-width: 768px) {
    /* Allarga la seconda card (Owner Benefits) a tutta larghezza */
    div[style*="display: flex"][style*="flex-wrap"][style*="justify-content"] > div:nth-child(2) {
      width: 100% !important;
    }
  }
`}</style>


      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          fontFamily: "'Poppins', sans-serif",
          backgroundColor: "#000",
          color: "#fff",
          flexWrap: "wrap",
          position: "relative"
        }}
      >
        <img
          src="/images/logo.png"
          alt="Logo"
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            width: "80px",
            height: "auto",
            zIndex: 10,
            userSelect: "none",
            pointerEvents: "none"
          }}
        />


{!walletConnected && (
  <>
    {/* MOBILE: Open in MetaMask */}
    {isMobile && !walletConnected && !window.ethereum && !menuOpen && (
      <a
        href="https://metamask.app.link/dapp/tuscanium.vercel.app/"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: "fixed",
          bottom: "1rem",
          right: "1rem",
          padding: "0.8rem 1.4rem",
          backgroundColor: "#ffa500",
          border: "none",
          borderRadius: "8px",
          color: "#000",
          fontWeight: "bold",
          fontSize: "1rem",
          textDecoration: "none",
          textAlign: "center",
          boxShadow: "0 0 10px rgba(0,0,0,0.3)",
          zIndex: 999
        }}
      >
        🦊 Open in MetaMask
      </a>
    )}

    {/* MOBILE: Connect Wallet */}
    {isMobile && !walletConnected && !!window.ethereum && (
      <button
        onClick={connectWallet}
        style={{
          position: "fixed",
          bottom: "1rem",
          right: "1rem",
          padding: "0.8rem 1.4rem",
          backgroundColor: "#ffa500",
          border: "none",
          borderRadius: "8px",
          color: "#000",
          fontWeight: "bold",
          fontSize: "1rem",
          cursor: "pointer",
          zIndex: 999,
          boxShadow: "0 0 10px rgba(0,0,0,0.3)"
        }}
      >
        Connect Wallet
      </button>
    )}

    {/* DESKTOP: Connect Wallet */}
    {!isMobile && (
      <button
        onClick={connectWallet}
        style={{
          position: "absolute",
          top: "100px",
          right: "1rem",
          padding: "0.8rem 1.4rem",
          backgroundColor: "#ffa500",
          border: "none",
          borderRadius: "8px",
          color: "#000",
          fontWeight: "bold",
          fontSize: "1rem",
          cursor: "pointer",
          zIndex: 999,
          boxShadow: "0 0 10px rgba(0,0,0,0.3)"
        }}
      >
        Connect Wallet
      </button>
    )}
  </>
)}






<Router>
  {/* Bottone fisso in alto a sinistra SOLO su mobile */}
  {isMobile && (
    <button
      onClick={() => setMenuOpen(!menuOpen)}
      style={{
        position: "fixed",
        top: "1rem",
        left: "1rem",
        padding: "0.6rem 1.2rem",
        backgroundColor: menuOpen ? "#ff4444" : "#0ff",
        border: "none",
        borderRadius: "6px",
        color: "#000",
        fontWeight: "bold",
        fontSize: "0.95rem",
        cursor: "pointer",
        zIndex: 999,
        transition: "background 0.2s ease",
      }}
    >
      {menuOpen ? "✖ Close" : "☰ Menu"}
    </button>
  )}

 <nav
  style={{
    width: isMobile ? (menuOpen ? "75%" : "0") : "260px",
    backgroundColor: "#111",
    padding: isMobile ? (menuOpen ? "2rem" : "0") : "2rem",
    paddingTop: isMobile
      ? menuOpen
        ? "6rem"   // 👈 Aumentato da 4rem a 6rem
        : "0"
      : "2rem",
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
    position: isMobile ? "fixed" : "sticky",
    top: 0,
    height: "100vh",
    boxSizing: "border-box",
    overflow: "hidden",
    opacity: isMobile ? (menuOpen ? 1 : 0) : 1,
    pointerEvents: isMobile ? (menuOpen ? "auto" : "none") : "auto",
    transition: "all 0.3s ease, padding-top 0.3s ease",
    zIndex: 50,
  }}
>

    

    <Link
      to="/about"
      style={{
        color: "#fff",
        fontSize: "1.1rem",
        padding: "0.75rem 1rem",
        textDecoration: "none",
        borderRadius: "6px",
        transition: "all 0.3s ease",
      }}
      onClick={() => isMobile && setMenuOpen(false)}
    >
      About Us
    </Link>
    <Link
      to="/mint"
      style={{
        color: "#fff",
        fontSize: "1.1rem",
        padding: "0.75rem 1rem",
        textDecoration: "none",
        borderRadius: "6px",
        transition: "all 0.3s ease",
      }}
      onClick={() => isMobile && setMenuOpen(false)}
    >
      Mint
    </Link>
    <Link
      to="/collections"
      style={{
        color: "#fff",
        fontSize: "1.1rem",
        padding: "0.75rem 1rem",
        textDecoration: "none",
        borderRadius: "6px",
        transition: "all 0.3s ease",
      }}
      onClick={() => isMobile && setMenuOpen(false)}
    >
      Our Collections
    </Link>
    <Link
      to="/roadmap"
      style={{
        color: "#fff",
        fontSize: "1.1rem",
        padding: "0.75rem 1rem",
        textDecoration: "none",
        borderRadius: "6px",
        transition: "all 0.3s ease",
      }}
      onClick={() => isMobile && setMenuOpen(false)}
    >
      Roadmap
    </Link>
    <Link
      to="/howtobuy"
      style={{
        color: "#fff",
        fontSize: "1.1rem",
        padding: "0.75rem 1rem",
        textDecoration: "none",
        borderRadius: "6px",
        transition: "all 0.3s ease",
      }}
      onClick={() => isMobile && setMenuOpen(false)}
    >
      How to Buy
    </Link>
    <Link
      to="/redeem"
      style={{
        color: "#fff",
        fontSize: "1.1rem",
        padding: "0.75rem 1rem",
        textDecoration: "none",
        borderRadius: "6px",
        transition: "all 0.3s ease",
      }}
      onClick={() => isMobile && setMenuOpen(false)}
    >
      Redeem free Canvas 🎁
    </Link>
  </nav>

  <main
    style={{
      flexGrow: 1,
      overflowY: "auto",
      animation: "fadeIn 0.8s ease-in-out",
    }}
  >
    <Routes>
      <Route
        path="/"
        element={
          <MintPage
            onMint={mint}
            minting={minting}
            error={error}
            success={success}
            walletConnected={walletConnected}
            connectWallet={connectWallet}
          />
        }
      />
      <Route path="/about" element={<AboutUs />} />
      <Route
        path="/mint"
        element={
          <MintPage
            onMint={mint}
            minting={minting}
            error={error}
            success={success}
            walletConnected={walletConnected}
            connectWallet={connectWallet}
          />
        }
      />
      <Route path="/collections" element={<OurCollections />} />
      <Route path="/roadmap" element={<Roadmap />} />
      <Route path="/howtobuy" element={<HowToBuy />} />
      <Route
        path="/redeem"
        element={
          <RedeemCanvas
            burnVoucher={burnVoucher}
            burning={burning}
            burnError={burnError}
            burnSuccess={burnSuccess}
            walletConnected={walletConnected}
            burnTxHash={burnTxHash}
            purchaseTxHash={purchaseTxHash}
            walletAddress={walletAddress}
            buyCanvas={buyCanvas}
          />
        }
      />
    </Routes>
  </main>
</Router>

 
<footer
  style={{
    width: "100%",
    padding: "0.6rem 1rem 1rem",
    backgroundColor: "#111",
    textAlign: "center",
    color: "#ccc",
    fontSize: "0.95rem",
    boxShadow: "0 -2px 8px rgba(0,0,0,0.4)",
    marginTop: "3rem"
  }}
>
  <p style={{ marginBottom: "0.4rem", fontWeight: "bold" }}>Follow us:</p>
  <div style={{ display: "flex", justifyContent: "center", gap: "1.2rem", flexWrap: "wrap" }}>
    <a
      href="https://www.instagram.com/tuscanium/?hl=am-et"
      target="_blank"
      rel="noopener noreferrer"
      style={{
        color: "#0ff",
        textDecoration: "none",
        display: "flex",
        alignItems: "center",
        gap: "0.4rem",
      }}
    >
      <img src="/images/instagram.png" alt="Instagram" style={{ width: "18px", height: "18px" }} />
      Instagram
    </a>
    <a
      href="https://x.com/tuscanium"
      target="_blank"
      rel="noopener noreferrer"
      style={{
        color: "#0ff",
        textDecoration: "none",
        display: "flex",
        alignItems: "center",
        gap: "0.4rem",
      }}
    >
      <img src="/images/x.png" alt="X" style={{ width: "18px", height: "18px" }} />
      X
    </a>
    <a
      href="https://discord.gg/8MZatdFz3X"
      target="_blank"
      rel="noopener noreferrer"
      style={{
        color: "#0ff",
        textDecoration: "none",
        display: "flex",
        alignItems: "center",
        gap: "0.4rem",
      }}
    >
      <img src="/images/discord.png" alt="Discord" style={{ width: "18px", height: "18px" }} />
      Discord
    </a>
  </div>
</footer>

<Analytics />

</div>
</>
);
}
