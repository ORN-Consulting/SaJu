const FEATURES = [
  {
    icon: '\uD83D\uDCDA',
    title: '\uC804\uD1B5 \uBA85\uB9AC\uD559 \uAE30\uBC18 \uBD84\uC11D',
    description: '\uC218\uCC9C \uB144\uAC04 \uC774\uC5B4\uC838 \uC628 \uBA85\uB9AC\uD559 \uC774\uB860\uC744 \uADDC\uCE59\uC73C\uB85C \uAD6C\uD604\uD588\uC5B4\uC694. AI \uCD94\uCE21\uC774 \uC544\uB2CC \uC804\uD1B5 \uC774\uB860\uC5D0 \uB530\uB978 \uC815\uD655\uD55C \uBD84\uC11D\uC744 \uC81C\uACF5\uD574\uC694.',
  },
  {
    icon: '\u26A1',
    title: '\uAC00\uC785 \uC5C6\uC774 \uBC14\uB85C \uBD84\uC11D',
    description: '\uD68C\uC6D0\uAC00\uC785\uC774\uB098 \uB85C\uADF8\uC778 \uC5C6\uC774 \uC0DD\uB144\uC6D4\uC77C\uC2DC\uB9CC \uC785\uB825\uD558\uBA74 \uBC14\uB85C \uACB0\uACFC\uB97C \uD655\uC778\uD560 \uC218 \uC788\uC5B4\uC694.',
  },
  {
    icon: '\uD83C\uDF81',
    title: '\uC644\uC804 \uBB34\uB8CC, \uBB34\uC81C\uD55C \uC774\uC6A9',
    description: '\uD69F\uC218 \uC81C\uD55C\uC774\uB098 \uC720\uB8CC \uAE30\uB2A5 \uC5C6\uC774 \uBAA8\uB4E0 \uBD84\uC11D\uC744 \uBB34\uB8CC\uB85C \uC774\uC6A9\uD560 \uC218 \uC788\uC5B4\uC694.',
  },
];

export default function FeatureCards() {
  return (
    <section id="features" className="py-16 px-6">
      <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
        {FEATURES.map((feature) => (
          <div
            key={feature.title}
            className="p-6 rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="text-3xl mb-4">{feature.icon}</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
