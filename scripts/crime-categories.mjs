/** Editorial discovery tags, inferred from public text, never presented as official RSS metadata. */
export function classifyEpisode(title, description = '') {
  const text = `${title} ${description}`.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const tags = [];
  const matches = pattern => pattern.test(text);
  if (matches(/serial.?kill|κατα συρρο|κατ.?εξακολουθηση|jeffrey dahmer|νταμερ|bundy|μπαντι|ramirez|ραμιρεζ|gacy|γκεϊσι|chikatilo|τσικατιλο|albert fish|αλμπερτ φις|ed gein|εντ γκιν|dennis rader|dennis nilsen|dennis nielsen|des no.|btk|ridgeway|ridgway|γκριν ριβερ|green river|corll|κορλ|shipman|σιπμαν|αιγυπτιο.*κανιβαλο|δολοφονο.*ζοντιακ|zodiac killer/)) tags.push('serial-killers');
  if (matches(/\bcult\b|\bcults\b|αιρεσ|σεκτ|jonestown|jim jones|τζιμ τζοουνς|manson|μανσον|heaven.s gate|waco|γουεικο|σατανιστ|aum shinrikyo|nxivm/)) tags.push('cults');
  if (matches(/robber|\bheist\b|ληστ|κλοπ|διαρρηξ|bank job|bonnie.*clyde|μπονι.*κλαιντ/)) tags.push('robberies');
  if (matches(/εθνικου διχασμου|εθνικο διχασμο|μεσοπολεμ|μεσοπολεμικ|historical|histor(?:y|ic) crime|ιστορικ|rasputin|ρασπουτιν|chernobyl|τσερνομπιλ|σαλεμ|\bsalem\b|jack the ripper|αντεροβγαλτη|βικτωριαν|victorian|μεσαίων|μεσαιων|αρχαια|\bancient\b|βαμπιρ.*σερβια|lizzie borden|λιζι μπορντεν|black dahlia|μαυρη νταλια/)) tags.push('historical');
  if (matches(/unsolved|myster|μυστηρι|αλυτ|ανεξιχνιαστ|lead masks|ζοντιακ|\bzodiac\b|dyatlov|ντιατλοφ|bermuda|βερμουδ/)) tags.push('unsolved');
  if (matches(/disappear|missing|εξαφανισ|αγνοουμεν|madeleine|μαντλιν|maura murray|μαουρα/)) tags.push('disappearances');
  return tags.length ? tags : ['other'];
}
