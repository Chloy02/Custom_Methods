import type { WalnutContext } from './walnut';

/** @walnut_method
 * name: Generate Random Phone Number
 * description: Generate a random phone number and store in $[phoneNumber]
 * actionType: custom_generate_phone_number
 * context: shared
 * needsLocator: false
 * category: Data Generation
 */
export async function generatePhoneNumber(ctx: WalnutContext) {
  // args[0] = "phoneNumber" (from $[phoneNumber])
  const areaCodes = [
    '201', '202', '203', '205', '206', '207', '208', '209', '210',
    '212', '213', '214', '215', '216', '217', '218', '219', '224',
    '225', '228', '229', '231', '234', '239', '240', '248', '251',
    '252', '253', '254', '256', '260', '262', '267', '269', '270',
    '272', '276', '281', '301', '302', '303', '304', '305', '307',
  ];

  const areaCode = areaCodes[Math.floor(Math.random() * areaCodes.length)];
  const exchange = String(Math.floor(Math.random() * 800) + 200); // 200–999
  const subscriber = String(Math.floor(Math.random() * 9000) + 1000); // 1000–9999

  const phoneNumber = `${areaCode}-${exchange}-${subscriber}`;

  ctx.log('Generated phone number: ' + phoneNumber);
  ctx.setVariable(ctx.args[0], phoneNumber);
}
