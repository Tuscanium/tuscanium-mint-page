import React, { useState } from "react";
import emailjs from "@emailjs/browser";

const COUNTRIES = [
  "Afghanistan", "Aland Islands", "Albania", "Algeria", "American Samoa", "Andorra", "Angola", "Anguilla", "Antigua and Barbuda",
  "Argentina", "Armenia", "Aruba", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados",
  "Belarus", "Belgium", "Belize", "Benin", "Bermuda", "Bhutan", "Bolivia", "Bonaire", "Bosnia and Herzegovina", "Botswana",
  "Brazil", "British Virgin Islands", "Brunei", "Bulgaria", "Burkina Faso", "Cambodia", "Cameroon", "Canada", "Cape Verde",
  "Cayman Islands", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Congo (Congo-Brazzaville)", "Cook Islands",
  "Costa Rica", "Croatia", "Curaçao", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic",
  "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Falkland Islands",
  "Faroe Islands", "Fiji", "Finland", "France", "French Guiana", "French Polynesia", "French Southern Territories", "Gabon",
  "Gambia", "Georgia", "Germany", "Ghana", "Gibraltar", "Greece", "Greenland", "Grenada", "Guadeloupe", "Guam", "Guatemala",
  "Guernsey", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hong Kong", "Hungary", "Iceland", "India", "Indonesia",
  "Iraq", "Ireland", "Israel", "Italy", "Ivory Coast", "Jamaica", "Japan", "Jersey", "Jordan", "Kazakhstan", "Kenya", "Kiribati",
  "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Liechtenstein", "Lithuania", "Luxembourg", "Macao",
  "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall-Islands", "Martinique", "Mauritania", "Mauritius",
  "Mayotte", "Mexico", "Micronesia", "Monaco", "Mongolia", "Montenegro", "Montserrat", "Morocco", "Mozambique", "Myanmar",
  "Namibia", "Nauru", "Nepal", "Netherlands", "New Caledonia", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Niue",
  "North Macedonia", "Norway", "Oman", "Pakistan", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland",
  "Portugal", "Puerto Rico", "Qatar", "Republic of Moldova", "Romania", "Rwanda", "Réunion", "Saint Kitts and Nevis",
  "Saint Lucia", "Saint Pierre and Miquelon", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal",
  "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa",
  "South Korea", "South Sudan", "Spain", "Sri Lanka", "St Vincent and the Grenadines", "St. Helena", "Suriname", "Sweden",
  "Switzerland", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan",
  "Turks and Caicos", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "Uruguay", "US Virgin Islands", "USA",
  "Uzbekistan", "Vanuatu", "Vatican City State", "Venezuela", "Vietnam", "Yemen", "Zambia", "British Indian Ocean Territory",
  "Palau", "Pitcairn", "St. Maarten", "Timor-Leste", "Togo", "Tonga", "Tristan da Cunha", "Tuvalu", "Wallis and Futuna"
];

export default function RedeemForm({ burnTxHash, walletAddress }) {
  const [formData, setFormData] = useState({
    country: "Italy",
    firstName: "",
    lastName: "",
    address1: "",
    address2: "",
    company: "",
    postCode: "",
    phone: "",
    city: "",
    stateProvince: "",
    email: ""
  });

  const [emailSent, setEmailSent] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  const handleSubmit = (e) => {
  e.preventDefault();

  const message = `
Wallet Address: ${walletAddress}
Transaction Hash: ${burnTxHash}

First Name: ${formData.firstName}
Last Name: ${formData.lastName}
Email: ${formData.email}
Phone: ${formData.phone}
Company: ${formData.company}

Country: ${formData.country}
State / Province / Region: ${formData.stateProvince}
City: ${formData.city}
Post/Zip Code: ${formData.postCode}

Address Line 1: ${formData.address1}
Address Line 2: ${formData.address2}
  `;

  console.log("MESSAGE TO SEND:", message);

  emailjs.send(
    "service_vo9tnir",
    "template_nfzxmw5",
    { message },
    "JJRSZKUKVru0hJHQR"
  )
  .then((response) => {
    console.log("SUCCESS!", response.status, response.text);
    setEmailSent(true);
  })
  .catch((err) => {
    console.error("FAILED...", err);
    alert("Failed to send email. Please try again later.");
  });
};


  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 600, margin: "0 auto", color: "#fff", fontFamily: "'Poppins', sans-serif" }}>
      <h2>Wallet Address</h2>
      <input
        type="text"
        readOnly
        value={walletAddress}
        style={inputStyle}
      />

      <label htmlFor="country">Country *</label>
      <select name="country" id="country" value={formData.country} onChange={handleChange} required style={inputStyle}>
        {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
      </select>

      {["firstName", "lastName", "email", "phone", "company", "address1", "address2", "postCode", "city", "stateProvince"].map(field => (
        <div key={field}>
          <label htmlFor={field}>
            {field === "address1" ? "Address Line 1 *" :
             field === "address2" ? "Address Line 2 (optional)" :
             field === "stateProvince" ? "State / Province / Region " :
             field === "company" ? "Company (optional)" :
             `${field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, " $1")} *`}
          </label>
          <input
            type={field === "email" ? "email" : field === "phone" ? "tel" : "text"}
            name={field}
            id={field}
            value={formData[field]}
            onChange={handleChange}
            required={!["address2", "company", "stateProvince"].includes(field)}
              placeholder={field === "phone" ? "+39 333 1234567" : undefined}
            style={inputStyle}
          />
        </div>
      ))}

      <button
        type="submit"
        style={{
          backgroundColor: "#0ff",
          color: "#000",
          fontWeight: "bold",
          padding: "0.8rem 2rem",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          marginTop: "1rem"
        }}
      >
        Submit Request
      </button>
<p
  style={{
    marginTop: "1rem",
    fontSize: "0.9rem",
    color: "#f55",
    lineHeight: "1.4",
    fontWeight: "bold"
  }}
>
  Please Note:<br/>
  1 – Incorrect or incomplete data may cause delays or loss of your order.<br/>
  Please double-check that all your information is correct before submitting.<br/>
  2 – Each voucher burn will be verified along with wallet ownership and transaction details.<br/>
  No refunds or shipments will be processed if any fraudulent activity or attempts to bypass the system are detected.
</p>




      {emailSent && (
        <p style={{ marginTop: "1rem", color: "#0f0" }}>
          Your request was sent successfully! 🎉
          You will receive a confirmation email and a certificate of authenticity for your canvas within the next 24 hours.
          
        </p>
      )}
    </form>
  );
}

const inputStyle = {
  width: "100%",
  padding: "0.6rem",
  fontSize: "1rem",
  borderRadius: "6px",
  border: "1px solid #0ff",
  backgroundColor: "#111",
  color: "#fff",
  marginBottom: "1rem"
};
