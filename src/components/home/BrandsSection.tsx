import Section from '../ui/Section';

export default function BrandsSection() {
  const brands = [
    'Premium Equipment Co.',
    'ChefMaster',
    'KitchenPro',
    'CoolTech',
    'RestaurantGear',
    'EliteKitchen'
  ];

  return (
    <Section background="light">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Trusted Equipment Brands</h2>
        <p className="text-gray-600">We partner with leading manufacturers worldwide</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
        {brands.map((brand, index) => (
          <div
            key={index}
            className="flex items-center justify-center p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-orange-500 transition-all duration-300 hover:shadow-lg"
          >
            <span className="text-gray-700 font-semibold text-center hover:text-orange-600 transition-colors">
              {brand}
            </span>
          </div>
        ))}
      </div>
    </Section>
  );
}
