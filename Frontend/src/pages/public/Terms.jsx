import { Helmet } from "react-helmet-async";

const Terms = () => {
  return (
    <div className="bg-[#EDECEC]">
      <Helmet>
        <title>Terms & Conditions | Ellcworth Express Ltd</title>
        <meta name="description" content="Terms and conditions for using Ellcworth Express Ltd freight and shipping services." />
        <link rel="canonical" href="https://www.ellcworth.com/terms" />
      </Helmet>

      <section className="relative w-full bg-[#1A2930] text-white py-20 md:py-28">
        <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
          <span className="inline-flex items-center rounded-full border border-[#FFA500] bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-100 mb-6">Legal</span>
          <h1 className="text-3xl md:text-4xl font-semibold uppercase mb-4">Terms & Conditions</h1>
          <p className="text-gray-400 text-sm">Last updated: June 2025</p>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8 prose prose-slate max-w-none text-gray-700 space-y-8 text-base leading-relaxed">

          <div>
            <h2 className="text-xl font-semibold text-[#1A2930] uppercase mb-3">1. About us</h2>
            <p>Ellcworth Express Ltd is a freight forwarding and logistics company registered in England and Wales. Our registered address and contact details are available on request. References to "we", "us", or "our" in these terms refer to Ellcworth Express Ltd.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[#1A2930] uppercase mb-3">2. Scope of services</h2>
            <p>We provide freight forwarding, customs clearance coordination, cargo consolidation, RoRo vehicle shipping, air freight, and related logistics services between the United Kingdom and Africa. We act as agents on behalf of our clients and, where applicable, as principals.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[#1A2930] uppercase mb-3">3. Quotations and pricing</h2>
            <p>All quotations are indicative and valid for 5 working days from the date of issue unless otherwise stated. Final pricing is confirmed in writing prior to booking. Prices are subject to change due to carrier surcharges, port fees, currency fluctuations, or changes in applicable duties and taxes. Any indicative prices published on our website (including RoRo from £750 and FCL from £2,500) are subject to availability and cargo specifications.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[#1A2930] uppercase mb-3">4. Bookings and acceptance</h2>
            <p>A booking is confirmed when we issue written confirmation and receive any required deposit or payment. By making a booking you confirm that you are the lawful owner of the cargo or are authorised to act on behalf of the owner, and that all information provided is accurate and complete.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[#1A2930] uppercase mb-3">5. Customer obligations</h2>
            <p>You are responsible for ensuring that all cargo is accurately described, correctly classified under applicable customs tariff codes, and accompanied by complete and accurate documentation. You must comply with all applicable UK export regulations and the import regulations of the destination country. Any costs, delays, fines, or losses arising from inaccurate or incomplete information provided by you are your responsibility.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[#1A2930] uppercase mb-3">6. Prohibited and restricted goods</h2>
            <p>We do not accept cargo that is illegal under UK law or the law of the destination country, including but not limited to controlled substances, counterfeit goods, weapons, and goods subject to sanctions. We reserve the right to refuse or return any cargo that we reasonably believe to be prohibited or misdeclared, at the customer's cost.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[#1A2930] uppercase mb-3">7. Liability and limitations</h2>
            <p>Our liability as freight forwarders is governed by the British International Freight Association (BIFA) Standard Trading Conditions, current edition, which are incorporated into these terms by reference. Our liability for loss or damage to cargo is limited in accordance with those conditions. We strongly recommend that customers obtain appropriate cargo insurance for all shipments. We are not liable for delays caused by port congestion, customs examination, carrier scheduling changes, acts of God, or other circumstances beyond our reasonable control.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[#1A2930] uppercase mb-3">8. Insurance</h2>
            <p>We do not automatically insure cargo on your behalf. Cargo insurance must be arranged separately by the customer unless we have agreed in writing to arrange cover. We can assist with cargo insurance on request.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[#1A2930] uppercase mb-3">9. Payment terms</h2>
            <p>Payment terms are as agreed in writing at the time of booking. We reserve the right to withhold release of cargo or documentation until all outstanding amounts are settled in full. Overdue invoices may attract interest in accordance with the Late Payment of Commercial Debts (Interest) Act 1998.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[#1A2930] uppercase mb-3">10. Customs and duties</h2>
            <p>Import duties, taxes, and customs fees payable at the destination country are the sole responsibility of the customer or consignee. We may advance payment of such charges on your behalf, in which case these will be invoiced to you in addition to our service fees. Any duty estimates we provide are indicative only and based on the information available at the time.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[#1A2930] uppercase mb-3">11. Governing law</h2>
            <p>These terms and conditions are governed by the laws of England and Wales. Any disputes arising from our services shall be subject to the exclusive jurisdiction of the courts of England and Wales.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[#1A2930] uppercase mb-3">12. Changes to these terms</h2>
            <p>We may update these terms from time to time. The current version will always be published on our website. Continued use of our services following any update constitutes acceptance of the revised terms.</p>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">For any questions regarding these terms, contact us at <a href="mailto:cs@ellcworth.com" className="text-[#FFA500] hover:underline">cs@ellcworth.com</a>.</p>
          </div>

        </div>
      </section>
    </div>
  );
};

export default Terms;
