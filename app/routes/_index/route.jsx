import { redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { login } from "../../shopify.server";
import styles from "./styles.module.css";

export const loader = async ({ request }) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return { showForm: Boolean(login) };
};

export default function App() {
  const { showForm } = useLoaderData();

  return (
    <div className={styles.index}>
      <div className={styles.content}>
        
        <div className={styles.header}>
          <h1 className={styles.heading}>Never Miss a Sale Again</h1>
          <p className={styles.text}>
            Recapture lost revenue with automated, beautifully designed back-in-stock notifications that bring customers back when they're ready to buy.
          </p>
        </div>

        {showForm && (
          <div className={styles.formContainer}>
            <Form className={styles.form} method="post" action="/auth/login">
              <label className={styles.label}>
                <span className={styles.labelText}>Enter your Shop domain to log in</span>
                <input 
                  className={styles.input} 
                  type="text" 
                  name="shop" 
                  placeholder="e.g. my-shop-domain.myshopify.com"
                  required
                />
              </label>
              <button className={styles.button} type="submit">
                Log in to Dashboard
              </button>
            </Form>
          </div>
        )}

        <div className={styles.features}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🚀</div>
            <h3 className={styles.featureTitle}>Instant Notifications</h3>
            <p className={styles.featureDesc}>
              Automatically alert subscribers the moment inventory is replenished, maximizing your conversion rates.
            </p>
          </div>
          
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🎨</div>
            <h3 className={styles.featureTitle}>Premium Design</h3>
            <p className={styles.featureDesc}>
              Choose from beautiful, conversion-optimized templates that integrate seamlessly into your storefront.
            </p>
          </div>
          
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>📈</div>
            <h3 className={styles.featureTitle}>Analytics & Insights</h3>
            <p className={styles.featureDesc}>
              Track your most demanded products and make data-driven inventory decisions.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
