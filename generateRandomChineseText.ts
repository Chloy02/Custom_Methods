/** @walnut_method
 * name: Generate Random Chinese Text
 * description: Generate a random Chinese text string and store in $[chineseSearchText]
 * actionType: custom_generate_random_chinese_text
 * context: shared
 * needsLocator: false
 * category: Data Generation
 */
export async function generateRandomChineseText(ctx: any) {
  // Common Chinese characters covering everyday words and topics
  const chineseChars = [
    '你', '好', '世', '界', '中', '国', '人', '大', '学', '生',
    '工', '作', '家', '时', '间', '朋', '友', '爱', '心', '日',
    '月', '年', '水', '火', '山', '地', '天', '花', '书', '车',
    '电', '话', '手', '机', '网', '络', '城', '市', '公', '司',
    '美', '食', '旅', '行', '音', '乐', '影', '运', '动', '健',
    '康', '快', '乐', '幸', '福', '自', '然', '科', '技', '文',
    '化', '历', '史', '艺', '术', '语', '言', '教', '育', '经',
    '济', '政', '治', '社', '会', '环', '境', '能', '源', '风',
  ];

  // Random length between 2 and 5 characters
  const length = Math.floor(Math.random() * 4) + 2;

  let result = '';
  for (let i = 0; i < length; i++) {
    result += chineseChars[Math.floor(Math.random() * chineseChars.length)];
  }

  ctx.log(`Generated random Chinese text: ${result}`);
  ctx.setVariable('chineseSearchText', result);

  const stored = ctx.getVariable('chineseSearchText');
  if (stored !== result) {
    throw new Error(`chineseSearchText verification failed: expected "${result}" but got "${stored}"`);
  }

  ctx.log(`Verification passed — chineseSearchText: "${stored}"`);
}
