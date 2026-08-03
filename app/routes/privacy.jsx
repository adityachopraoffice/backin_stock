import { json } from "@remix-run/node";
import { Link } from "@remix-run/react";

export const meta = () => {
  return [{ title: "Privacy Policy | BackInStock Notifier" }];
};

export default function PrivacyPolicy() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.6", maxWidth: "800px", margin: "0 auto", padding: "40px 20px", color: "#202223" }}>
      <header style={{ borderBottom: "1px solid #e1e3e5", paddingBottom: "20px", marginBottom: "30px" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "8px" }}>Privacy Policy</h1>
        <p style={{ color: "#6d7175", margin: "0" }}>Last updated: {new Date().toLocaleDateString()}</p>
      </header>

      <section style={{ marginBottom: "30px" }}>
        <h2>1. Information We Collect</h2>
        <p>When you install the BackInStock Notifier app, we are automatically able to access certain types of information from your Shopify account, including:</p>
        <ul>
          <li>Basic shop information (e.g., domain, email address)</li>
          <li>Product information (to monitor inventory levels)</li>
        </ul>
        <p>Additionally, we collect information from your customers when they sign up for back-in-stock alerts, specifically their email addresses and the product they are interested in.</p>
      </section>

      <section style={{ marginBottom: "30px" }}>
        <h2>2. How We Use Your Information</h2>
        <p>We use the collected information for the following purposes:</p>
        <ul>
          <li>To provide and maintain the BackInStock Notifier service.</li>
          <li>To automatically send email notifications to customers when their requested product is restocked.</li>
          <li>To provide customer support and troubleshoot issues.</li>
        </ul>
      </section>

      <section style={{ marginBottom: "30px" }}>
        <h2>3. Data Sharing and Disclosure</h2>
        <p>We do not sell or rent your personal information to third parties. We may share information with trusted third-party service providers (like email delivery services) solely for the purpose of operating our app.</p>
      </section>

      <section style={{ marginBottom: "30px" }}>
        <h2>4. Data Retention</h2>
        <p>We retain customer email addresses and subscription data only as long as necessary to fulfill the back-in-stock notification purpose. Store owners can delete this data at any time through the app dashboard.</p>
      </section>

      <section style={{ marginBottom: "30px" }}>
        <h2>5. Your Rights</h2>
        <p>If you are a European resident, you have the right to access personal information we hold about you and to ask that your personal information be corrected, updated, or deleted. If you would like to exercise this right, please contact us.</p>
      </section>

      <section style={{ marginBottom: "30px" }}>
        <h2>6. Contact Us</h2>
        <p>For more information about our privacy practices, if you have questions, or if you would like to make a complaint, please contact us by email at support@backin-stock.vercel.app.</p>
      </section>
      
      <footer style={{ marginTop: "40px", textAlign: "center", borderTop: "1px solid #e1e3e5", paddingTop: "20px" }}>
        <Link to="/" style={{ color: "#005bd3", textDecoration: "none" }}>&larr; Return to Home</Link>
      </footer>
    </div>
  );
}
