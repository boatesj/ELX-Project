import { Helmet } from "react-helmet-async";

const Privacy = () => {
  return (
    <div className="bg-[#EDECEC]">
      <Helmet>
        <title>Privacy Policy | Ellcworth Express Ltd</title>
        <meta name="description" content="Privacy policy for Ellcworth Express Ltd — how we collect, use and protect your personal data." />
        <link rel="canonical" href="https://www.ellcworth.com/privacy" />
      </Helmet>

      <section className="relative w-full bg-[#1A2930] text-white py-20 md:py-28">
        <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
          <span className="inline-flex items-center rounded-full border border-[#FFA500] bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-100 mb-6">Legal</span>
          <h1 className="text-3xl md:text-4xl font-semibold uppercase mb-4">Privacy Policy</h1>
          <p className="text-gray-400 text-sm">Last updated: June 2025</p>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8 prose prose-slate max-w-none text-gray-700 space-y-8 text-base leading-relaxed">

          <div>
            <h2 className="text-xl font-semibold text-[#1A2930] uppercase mb-3">1. Who we are</h2>
            <p>Ellcworth Express Ltd is the data controller for personal data collected through this website and in the course of providing our freight and logistics services. You can contact us at <a href="mailto:cs@ellcworth.com" className="text-[#FFA500] hover:underline">cs@ellcworth.com</a>.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[#1A2930] uppercase mb-3">2. What data we collect</h2>
            <p>We collect the following categories of personal data:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Contact details: name, email address, telephone number</li>
              <li>Shipment information: cargo descriptions, collection and delivery addresses, consignee details</li>
              <li>Identity documents: passport copies or other identification required for customs purposes</li>
              <li>Payment information: billing details (we do not store full card numbers)</li>
              <li>Communication records: emails, WhatsApp messages, and other correspondence with us</li>
              <li>Website usage data: IP address, browser type, pages visited (via Google Analytics)</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[#1A2930] uppercase mb-3">3. How we use your data</h2>
            <p>We use your personal data to:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Provide and manage freight and logistics services you have requested</li>
              <li>Prepare and submit customs and export documentation on your behalf</li>
              <li>Communicate with you about your shipments and enquiries</li>
              <li>Send service-related emails via Postmark</li>
              <li>Send marketing communications via Drip, where you have consented or where we have a legitimate interest</li>
              <li>Analyse website usage to improve our services via Google Analytics</li>
              <li>Comply with our legal obligations under UK law</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[#1A2930] uppercase mb-3">4. Legal basis for processing</h2>
            <p>We process your personal data on the following legal bases under UK GDPR:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li><strong>Contract:</strong> where processing is necessary to perform the freight services you have engaged us for</li>
              <li><strong>Legal obligation:</strong> where we are required to process data to comply with customs, export, or other legal requirements</li>
              <li><strong>Legitimate interests:</strong> for website analytics and service improvement, where this does not override your rights</li>
              <li><strong>Consent:</strong> for marketing communications, where required</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[#1A2930] uppercase mb-3">5. Who we share your data with</h2>
            <p>We share your personal data only where necessary to carry out your shipment or comply with legal requirements. Recipients include:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li><strong>Carriers and shipping lines:</strong> for booking and manifesting your cargo</li>
              <li><strong>Customs agents at destination ports</strong> (including Tema, Lagos, and Mombasa): for customs clearance</li>
              <li><strong>UK Border Force and HMRC:</strong> where required for export declarations</li>
              <li><strong>Ghana Revenue Authority (GRA) and equivalent:</strong> for import customs processing</li>
              <li><strong>Postmark:</strong> for transactional email delivery</li>
              <li><strong>Drip:</strong> for email marketing communications</li>
              <li><strong>Google Analytics:</strong> for anonymised website usage analysis</li>
              <li><strong>MongoDB Atlas:</strong> for secure data storage</li>
            </ul>
            <p className="mt-3">We do not sell your personal data to third parties.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[#1A2930] uppercase mb-3">6. International transfers</h2>
            <p>Some of your data is necessarily transferred to countries outside the UK as part of the customs clearance process (for example, to our agents in Ghana or Nigeria). Where data is transferred outside the UK, we take appropriate steps to ensure it is handled securely and in accordance with UK GDPR requirements.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[#1A2930] uppercase mb-3">7. How long we keep your data</h2>
            <p>We retain personal data for as long as necessary to fulfil the purposes for which it was collected, and in accordance with UK legal requirements. Shipment records and associated personal data are retained for 6 years following the completion of a shipment, in line with standard UK commercial record-keeping requirements. Marketing data is retained until you unsubscribe or withdraw consent.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[#1A2930] uppercase mb-3">8. Your rights</h2>
            <p>Under UK GDPR you have the right to:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Access the personal data we hold about you</li>
              <li>Correct inaccurate or incomplete data</li>
              <li>Request deletion of your data, subject to legal retention requirements</li>
              <li>Object to or restrict processing in certain circumstances</li>
              <li>Withdraw consent for marketing at any time</li>
              <li>Lodge a complaint with the Information Commissioner's Office (ICO) at <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="text-[#FFA500] hover:underline">ico.org.uk</a></li>
            </ul>
            <p className="mt-3">To exercise any of these rights, contact us at <a href="mailto:cs@ellcworth.com" className="text-[#FFA500] hover:underline">cs@ellcworth.com</a>.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[#1A2930] uppercase mb-3">9. Security</h2>
            <p>We take appropriate technical and organisational measures to protect your personal data against unauthorised access, loss, or disclosure. Our customer portal uses JWT authentication and all data is stored on encrypted infrastructure via MongoDB Atlas.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[#1A2930] uppercase mb-3">10. Changes to this policy</h2>
            <p>We may update this privacy policy from time to time. The current version will always be published at <a href="https://www.ellcworth.com/privacy" className="text-[#FFA500] hover:underline">ellcworth.com/privacy</a>.</p>
          </div>

        </div>
      </section>
    </div>
  );
};

export default Privacy;
