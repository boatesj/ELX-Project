import { Helmet } from "react-helmet-async";

const Cookies = () => {
  return (
    <div className="bg-[#EDECEC]">
      <Helmet>
        <title>Cookie Policy | Ellcworth Express Ltd</title>
        <meta name="description" content="Cookie policy for Ellcworth Express Ltd — what cookies we use and how to manage them." />
        <link rel="canonical" href="https://www.ellcworth.com/cookies" />
      </Helmet>

      <section className="relative w-full bg-[#1A2930] text-white py-20 md:py-28">
        <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
          <span className="inline-flex items-center rounded-full border border-[#FFA500] bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-100 mb-6">Legal</span>
          <h1 className="text-3xl md:text-4xl font-semibold uppercase mb-4">Cookie Policy</h1>
          <p className="text-gray-400 text-sm">Last updated: June 2025</p>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8 prose prose-slate max-w-none text-gray-700 space-y-8 text-base leading-relaxed">

          <div>
            <h2 className="text-xl font-semibold text-[#1A2930] uppercase mb-3">What are cookies?</h2>
            <p>Cookies are small text files placed on your device when you visit a website. They allow the site to recognise your device and store certain information about your preferences or activity. Most browsers accept cookies by default, but you can configure your browser to refuse or delete them.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[#1A2930] uppercase mb-3">Cookies we use</h2>

            <div className="mt-4 space-y-6">

              <div className="rounded-xl border border-gray-200 bg-[#F9FAFB] p-5">
                <p className="font-semibold text-[#1A2930] mb-1">Essential cookies</p>
                <p className="text-sm text-gray-600 mb-2">These cookies are necessary for the website and customer portal to function. They cannot be disabled.</p>
                <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                  <li><strong>Authentication token (JWT):</strong> Keeps you logged in to your customer account during a session. Session-scoped — deleted when you close your browser.</li>
                </ul>
              </div>

              <div className="rounded-xl border border-gray-200 bg-[#F9FAFB] p-5">
                <p className="font-semibold text-[#1A2930] mb-1">Analytics cookies</p>
                <p className="text-sm text-gray-600 mb-2">We use Google Analytics 4 to understand how visitors use our website. This data is anonymised and used only to improve our site.</p>
                <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                  <li><strong>_ga:</strong> Distinguishes unique users. Expires after 2 years.</li>
                  <li><strong>_ga_JBHEVE88S0:</strong> Maintains session state. Expires after 2 years.</li>
                </ul>
                <p className="text-sm text-gray-500 mt-2">Google Analytics data is processed by Google LLC. For more information, see <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#FFA500] hover:underline">Google's privacy policy</a>.</p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-[#F9FAFB] p-5">
                <p className="font-semibold text-[#1A2930] mb-1">Marketing cookies</p>
                <p className="text-sm text-gray-600 mb-2">We use Drip for email marketing. If you have subscribed to communications from us, Drip may set cookies to track email engagement and website activity linked to those communications.</p>
                <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                  <li><strong>Drip tracking cookies:</strong> Used to measure email campaign performance and website visits originating from email links.</li>
                </ul>
                <p className="text-sm text-gray-500 mt-2">For more information, see <a href="https://www.drip.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#FFA500] hover:underline">Drip's privacy policy</a>.</p>
              </div>

            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[#1A2930] uppercase mb-3">Managing cookies</h2>
            <p>You can control and delete cookies through your browser settings. Note that disabling cookies may affect the functionality of the customer portal. Links to cookie management instructions for common browsers:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-[#FFA500] hover:underline">Google Chrome</a></li>
              <li><a href="https://support.mozilla.org/en-US/kb/enable-and-disable-cookies-website-preferences" target="_blank" rel="noopener noreferrer" className="text-[#FFA500] hover:underline">Mozilla Firefox</a></li>
              <li><a href="https://support.apple.com/en-gb/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-[#FFA500] hover:underline">Apple Safari</a></li>
              <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-[#FFA500] hover:underline">Microsoft Edge</a></li>
            </ul>
            <p className="mt-3">To opt out of Google Analytics tracking across all websites, you can install the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-[#FFA500] hover:underline">Google Analytics Opt-out Browser Add-on</a>.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[#1A2930] uppercase mb-3">Changes to this policy</h2>
            <p>We may update this cookie policy as our use of cookies changes. The current version will always be published at <a href="https://www.ellcworth.com/cookies" className="text-[#FFA500] hover:underline">ellcworth.com/cookies</a>.</p>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">Questions about our use of cookies? Contact us at <a href="mailto:cs@ellcworth.com" className="text-[#FFA500] hover:underline">cs@ellcworth.com</a>.</p>
          </div>

        </div>
      </section>
    </div>
  );
};

export default Cookies;
