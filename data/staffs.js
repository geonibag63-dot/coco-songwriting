const R='#c0504d';
export const STAFFS = {


st_cmaj: {measures:[
 [{keys:['c/4'],dur:'q',below:'1',below2:'도'},{keys:['d/4'],dur:'q',below:'2',below2:'레'},{keys:['e/4'],dur:'q',below:'3',below2:'미'},{keys:['f/4'],dur:'q',below:'4',below2:'파'}],
 [{keys:['g/4'],dur:'q',below:'5',below2:'솔'},{keys:['a/4'],dur:'q',below:'6',below2:'라'},{keys:['b/4'],dur:'q',below:'7',below2:'시'},{keys:['c/5'],dur:'q',below:'8(1)',below2:'도'}]]},
st_gmaj_acc: {measures:[
 [{keys:['g/4'],dur:'q',below:'G'},{keys:['a/4'],dur:'q',below:'A'},{keys:['b/4'],dur:'q',below:'B'},{keys:['c/5'],dur:'q',below:'C'}],
 [{keys:['d/5'],dur:'q',below:'D'},{keys:['e/5'],dur:'q',below:'E'},{keys:['f/5'],dur:'q',acc:{0:'#'},color:R,below:'F#'},{keys:['g/5'],dur:'q',below:'G'}]], top:20},
st_gmaj_key: {key:'G', keyCount:1, measures:[
 [{keys:['g/4'],dur:'q'},{keys:['a/4'],dur:'q'},{keys:['b/4'],dur:'q'},{keys:['c/5'],dur:'q'}],
 [{keys:['d/5'],dur:'q'},{keys:['e/5'],dur:'q'},{keys:['f/5'],dur:'q',color:R},{keys:['g/5'],dur:'q'}]], top:20},
st_triads: {measures:[
 [{keys:['c/4','e/4','g/4'],above:'C',below:'4+3',below2:'메이저'}],
 [{keys:['c/4','e/4','g/4'],acc:{1:'b'},above:'Cm',below:'3+4',below2:'마이너'}],
 [{keys:['c/4','e/4','g/4'],acc:{1:'b',2:'b'},above:'Cdim',below:'3+3',below2:'디미니시'}],
 [{keys:['c/4','e/4','g/4'],acc:{2:'#'},above:'Caug',below:'4+4',below2:'오그먼트'}]], width:600},
st_diatonic: {measures:[[
 {keys:['c/4','e/4','g/4'],above:'C',below:'I',below2:'대'},{keys:['d/4','f/4','a/4'],above:'Dm',below:'ii',below2:'소'},
 {keys:['e/4','g/4','b/4'],above:'Em',below:'iii',below2:'소'},{keys:['f/4','a/4','c/5'],above:'F',below:'IV',below2:'대'},
 {keys:['g/4','b/4','d/5'],above:'G',below:'V',below2:'대'},{keys:['a/4','c/5','e/5'],above:'Am',below:'vi',below2:'소'},
 {keys:['b/4','d/5','f/5'],above:'Bdim',below:'vii°',below2:'감'}]], beats:7, width:640},
st_sevenths: {measures:[[
 {keys:['c/4','e/4','g/4','b/4'],above:'Cmaj7',below:'Imaj7'},{keys:['d/4','f/4','a/4','c/5'],above:'Dm7',below:'ii7'},
 {keys:['e/4','g/4','b/4','d/5'],above:'Em7',below:'iii7'},{keys:['f/4','a/4','c/5','e/5'],above:'Fmaj7',below:'IVmaj7'},
 {keys:['g/4','b/4','d/5','f/5'],above:'G7',below:'V7'},{keys:['a/4','c/5','e/5','g/5'],above:'Am7',below:'vi7'},
 {keys:['b/4','d/5','f/5','a/5'],above:'Bm7♭5',below:'viiø7'}]], beats:7, width:640, aboveGap:30},
st_prog_c: {measures:[
 [{keys:['c/4','e/4','g/4'],above:'C',below:'I'}],[{keys:['b/3','d/4','g/4'],above:'G',below:'V'}],
 [{keys:['c/4','e/4','a/4'],above:'Am',below:'vi'}],[{keys:['c/4','f/4','a/4'],above:'F',below:'IV'}]], width:600, top:30},
st_prog_g: {key:'G', keyCount:1, measures:[
 [{keys:['b/3','d/4','g/4'],above:'G',below:'I'}],[{keys:['a/3','d/4','f/4'],above:'D',below:'V'}],
 [{keys:['b/3','e/4','g/4'],above:'Em',below:'vi'}],[{keys:['c/4','e/4','g/4'],above:'C',below:'IV'}]], width:600, top:30},
st_resolve: {measures:[
 [{keys:['b/3','d/4','f/4','g/4'],above:'G7',below:'V7',keyColor:{0:R,2:R}}],
 [{keys:['c/4','e/4','g/4'],above:'C',below:'I',keyColor:{0:R,1:R}}]], width:420},
st_amin: {measures:[[
 {keys:['a/3','c/4','e/4'],above:'Am',below:'i'},{keys:['b/3','d/4','f/4'],above:'Bdim',below:'ii°'},
 {keys:['c/4','e/4','g/4'],above:'C',below:'III'},{keys:['d/4','f/4','a/4'],above:'Dm',below:'iv'},
 {keys:['e/4','g/4','b/4'],above:'Em',below:'v'},{keys:['f/4','a/4','c/5'],above:'F',below:'VI'},
 {keys:['g/4','b/4','d/5'],above:'G',below:'VII'}],
 [{keys:['e/4','g/4','b/4'],acc:{1:'#'},above:'E',below:'V',below2:'실전용',keyColor:{1:R}}]], beats:7, width:660, weights:[7,1.8]},

st_cad: {measures:[
 [{keys:['g/3','b/3','d/4'],dur:'h',above:'G',below:'V',below2:'정격 마침'},{keys:['c/4','e/4','g/4'],dur:'h',above:'C',below:'I'}],
 [{keys:['f/3','a/3','c/4'],dur:'h',above:'F',below:'IV',below2:'변격 마침'},{keys:['c/4','e/4','g/4'],dur:'h',above:'C',below:'I'}],
 [{keys:['c/4','e/4','g/4'],dur:'h',above:'C',below:'I',below2:'반종지'},{keys:['g/3','b/3','d/4'],dur:'h',above:'G',below:'V'}],
 [{keys:['g/3','b/3','d/4'],dur:'h',above:'G',below:'V',below2:'거짓 마침'},{keys:['a/3','c/4','e/4'],dur:'h',above:'Am',below:'vi'}]], width:660},
st_bassline: {clef:'bass', measures:[
 [{keys:['c/3'],above:'C',below:'C'}],[{keys:['b/2'],above:'G/B',below:'B'}],[{keys:['a/2'],above:'Am',below:'A'}],
 [{keys:['g/2'],above:'Am/G',below:'G'}],[{keys:['f/2'],above:'F',below:'F'}]], width:600},
st_borrow: {measures:[
 [{keys:['f/4','a/4','c/5'],above:'F',below:'IV'}],[{keys:['c/4','e/4','g/4'],above:'C',below:'I'}],
 [{keys:['f/4','a/4','c/5'],above:'F',below:'IV'}],[{keys:['f/4','a/4','c/5'],acc:{1:'b'},above:'Fm',below:'iv',below2:'차용화음',keyColor:{1:R}}],
 [{keys:['c/4','e/4','g/4'],above:'C',below:'I'}]], width:660},
st_secdom: {measures:[
 [{keys:['a/3','c/4','e/4','g/4'],acc:{1:'#'},above:'A7',below:'V/ii',keyColor:{1:R}}],[{keys:['d/4','f/4','a/4'],above:'Dm',below:'ii'}],
 [{keys:['g/3','b/3','d/4','f/4'],above:'G7',below:'V7'}],[{keys:['c/4','e/4','g/4'],above:'C',below:'I'}]], width:600},
st_m1: {key:'A', keyCount:3, beats:4, width:660, measures:[[{keys:['f#/4'],dur:'q',above:'F#m'},{keys:['a/4'],dur:'q'},{keys:['c#/5'],dur:'h'}],[{keys:['d/5'],dur:'q',above:'D'},{keys:['a/4'],dur:'q'},{keys:['f#/4'],dur:'h'}],[{keys:['c#/5'],dur:'q',above:'A'},{keys:['a/4'],dur:'q'},{keys:['e/4'],dur:'h'}],[{keys:['e/4'],dur:'q',above:'E'},{keys:['g#/4'],dur:'q'},{keys:['b/4'],dur:'h'}]]},
st_m2: {key:'A', keyCount:3, beats:4, width:660, measures:[[{keys:['f#/4'],dur:'8',above:'F#m'},{keys:['g#/4'],dur:'8',color:'#c0504d'},{keys:['a/4'],dur:'q'},{keys:['b/4'],dur:'8',color:'#c0504d'},{keys:['c#/5'],dur:'qd'}],[{keys:['d/5'],dur:'8',above:'D'},{keys:['c#/5'],dur:'8',color:'#c0504d'},{keys:['b/4'],dur:'8',color:'#c0504d'},{keys:['a/4'],dur:'8'},{keys:['f#/4'],dur:'h'}],[{keys:['a/4'],dur:'q',above:'A'},{keys:['b/4'],dur:'8',color:'#c0504d'},{keys:['c#/5'],dur:'8'},{keys:['a/4'],dur:'h'}],[{keys:['b/4'],dur:'8',above:'E'},{keys:['a/4'],dur:'8',color:'#c0504d'},{keys:['g#/4'],dur:'q'},{keys:['e/4'],dur:'h'}]]},
st_m3: {key:'A', keyCount:3, beats:4, width:660, measures:[[{keys:['g#/4'],dur:'h',color:'#c0504d',above:'F#m'},{keys:['f#/4'],dur:'h'}],[{keys:['e/4'],dur:'h',color:'#c0504d',above:'D'},{keys:['f#/4'],dur:'h'}],[{keys:['d/4'],dur:'h',color:'#c0504d',above:'A'},{keys:['c#/4'],dur:'h'}],[{keys:['f#/4'],dur:'h',color:'#c0504d',above:'E'},{keys:['e/4'],dur:'h'}]]},
st_m5: {key:'A', keyCount:3, beats:4, width:660, measures:[[{keys:['b/4'],dur:'8r'},{keys:['f#/4'],dur:'8',above:'F#m'},{keys:['g#/4'],dur:'8',color:'#c0504d'},{keys:['a/4'],dur:'q'},{keys:['b/4'],dur:'8r'},{keys:['c#/5'],dur:'q'}],[{keys:['d/5'],dur:'8',above:'D'},{keys:['b/4'],dur:'qd',color:'#c0504d'},{keys:['b/4'],dur:'8r'},{keys:['a/4'],dur:'8'},{keys:['f#/4'],dur:'q'}],[{keys:['b/4'],dur:'8r'},{keys:['a/4'],dur:'8',above:'A'},{keys:['b/4'],dur:'8',color:'#c0504d'},{keys:['c#/5'],dur:'qd'},{keys:['b/4'],dur:'8r'},{keys:['a/4'],dur:'8'}],[{keys:['b/4'],dur:'q',above:'E'},{keys:['b/4'],dur:'8r'},{keys:['g#/4'],dur:'8'},{keys:['e/4'],dur:'h'}]]},
st_m6: {key:'A', keyCount:3, beats:4, width:660, measures:[[{keys:['a/4'],dur:'8',above:'A'},{keys:['b/4'],dur:'8',color:'#c0504d'},{keys:['c#/5'],dur:'q'},{keys:['b/4'],dur:'hr'}],[{keys:['g#/4'],dur:'8',above:'E'},{keys:['b/4'],dur:'8'},{keys:['c#/5'],dur:'q',color:'#c0504d'},{keys:['b/4'],dur:'hr'}],[{keys:['f#/4'],dur:'8',above:'F#m'},{keys:['a/4'],dur:'8'},{keys:['c#/5'],dur:'q'},{keys:['b/4'],dur:'hr'}],[{keys:['d/5'],dur:'8',above:'D'},{keys:['c#/5'],dur:'8',color:'#c0504d'},{keys:['b/4'],dur:'8',color:'#c0504d'},{keys:['a/4'],dur:'8'},{keys:['f#/4'],dur:'h'}]]},
st_song_v: {key:'A', keyCount:3, beats:4, width:660, measures:[[{keys:['f#/4'],dur:'8',above:'F#m'},{keys:['g#/4'],dur:'8',color:'#c0504d'},{keys:['a/4'],dur:'q'},{keys:['b/4'],dur:'8',color:'#c0504d'},{keys:['c#/5'],dur:'qd'}],[{keys:['d/5'],dur:'8',above:'D'},{keys:['c#/5'],dur:'8',color:'#c0504d'},{keys:['b/4'],dur:'8',color:'#c0504d'},{keys:['a/4'],dur:'8'},{keys:['f#/4'],dur:'h'}],[{keys:['a/4'],dur:'q',above:'A'},{keys:['b/4'],dur:'8',color:'#c0504d'},{keys:['c#/5'],dur:'8'},{keys:['a/4'],dur:'h'}],[{keys:['b/4'],dur:'8',above:'E'},{keys:['a/4'],dur:'8',color:'#c0504d'},{keys:['g#/4'],dur:'q'},{keys:['e/4'],dur:'h'}]]},
st_song_c: {key:'A', keyCount:3, beats:4, width:660, measures:[[{keys:['a/4'],dur:'q',above:'A'},{keys:['c#/5'],dur:'q'},{keys:['e/5'],dur:'h'}],[{keys:['b/4'],dur:'q',above:'E'},{keys:['g#/4'],dur:'q'},{keys:['b/4'],dur:'h'}],[{keys:['c#/5'],dur:'q',above:'F#m'},{keys:['d/5'],dur:'q',color:'#c0504d'},{keys:['c#/5'],dur:'h'}],[{keys:['d/5'],dur:'q',above:'D'},{keys:['a/4'],dur:'q'},{keys:['f#/4'],dur:'h'}]]},st_m1: {key:'A', keyCount:3, beats:4, width:660, measures:[[{keys:['f#/4'],dur:'q',above:'F#m'},{keys:['a/4'],dur:'q'},{keys:['c#/5'],dur:'h'}],[{keys:['d/5'],dur:'q',above:'D'},{keys:['a/4'],dur:'q'},{keys:['f#/4'],dur:'h'}],[{keys:['c#/5'],dur:'q',above:'A'},{keys:['a/4'],dur:'q'},{keys:['e/4'],dur:'h'}],[{keys:['e/4'],dur:'q',above:'E'},{keys:['g#/4'],dur:'q'},{keys:['b/4'],dur:'h'}]]},
st_m2: {key:'A', keyCount:3, beats:4, width:660, measures:[[{keys:['f#/4'],dur:'8',above:'F#m'},{keys:['g#/4'],dur:'8',color:'#c0504d'},{keys:['a/4'],dur:'q'},{keys:['b/4'],dur:'8',color:'#c0504d'},{keys:['c#/5'],dur:'qd'}],[{keys:['d/5'],dur:'8',above:'D'},{keys:['c#/5'],dur:'8',color:'#c0504d'},{keys:['b/4'],dur:'8',color:'#c0504d'},{keys:['a/4'],dur:'8'},{keys:['f#/4'],dur:'h'}],[{keys:['a/4'],dur:'q',above:'A'},{keys:['b/4'],dur:'8',color:'#c0504d'},{keys:['c#/5'],dur:'8'},{keys:['a/4'],dur:'h'}],[{keys:['b/4'],dur:'8',above:'E'},{keys:['a/4'],dur:'8',color:'#c0504d'},{keys:['g#/4'],dur:'q'},{keys:['e/4'],dur:'h'}]]},
st_m3: {key:'A', keyCount:3, beats:4, width:660, measures:[[{keys:['g#/4'],dur:'h',color:'#c0504d',above:'F#m'},{keys:['f#/4'],dur:'h'}],[{keys:['e/4'],dur:'h',color:'#c0504d',above:'D'},{keys:['f#/4'],dur:'h'}],[{keys:['d/4'],dur:'h',color:'#c0504d',above:'A'},{keys:['c#/4'],dur:'h'}],[{keys:['f#/4'],dur:'h',color:'#c0504d',above:'E'},{keys:['e/4'],dur:'h'}]]},
st_m5: {key:'A', keyCount:3, beats:4, width:660, measures:[[{keys:['b/4'],dur:'8r'},{keys:['f#/4'],dur:'8',above:'F#m'},{keys:['g#/4'],dur:'8',color:'#c0504d'},{keys:['a/4'],dur:'q'},{keys:['b/4'],dur:'8r'},{keys:['c#/5'],dur:'q'}],[{keys:['d/5'],dur:'8',above:'D'},{keys:['b/4'],dur:'qd',color:'#c0504d'},{keys:['b/4'],dur:'8r'},{keys:['a/4'],dur:'8'},{keys:['f#/4'],dur:'q'}],[{keys:['b/4'],dur:'8r'},{keys:['a/4'],dur:'8',above:'A'},{keys:['b/4'],dur:'8',color:'#c0504d'},{keys:['c#/5'],dur:'qd'},{keys:['b/4'],dur:'8r'},{keys:['a/4'],dur:'8'}],[{keys:['b/4'],dur:'q',above:'E'},{keys:['b/4'],dur:'8r'},{keys:['g#/4'],dur:'8'},{keys:['e/4'],dur:'h'}]]},
st_m6: {key:'A', keyCount:3, beats:4, width:660, measures:[[{keys:['a/4'],dur:'8',above:'A'},{keys:['b/4'],dur:'8',color:'#c0504d'},{keys:['c#/5'],dur:'q'},{keys:['b/4'],dur:'hr'}],[{keys:['g#/4'],dur:'8',above:'E'},{keys:['b/4'],dur:'8'},{keys:['c#/5'],dur:'q',color:'#c0504d'},{keys:['b/4'],dur:'hr'}],[{keys:['f#/4'],dur:'8',above:'F#m'},{keys:['a/4'],dur:'8'},{keys:['c#/5'],dur:'q'},{keys:['b/4'],dur:'hr'}],[{keys:['d/5'],dur:'8',above:'D'},{keys:['c#/5'],dur:'8',color:'#c0504d'},{keys:['b/4'],dur:'8',color:'#c0504d'},{keys:['a/4'],dur:'8'},{keys:['f#/4'],dur:'h'}]]},
st_song_v: {key:'A', keyCount:3, beats:4, width:660, measures:[[{keys:['f#/4'],dur:'8',above:'F#m'},{keys:['g#/4'],dur:'8',color:'#c0504d'},{keys:['a/4'],dur:'q'},{keys:['b/4'],dur:'8',color:'#c0504d'},{keys:['c#/5'],dur:'qd'}],[{keys:['d/5'],dur:'8',above:'D'},{keys:['c#/5'],dur:'8',color:'#c0504d'},{keys:['b/4'],dur:'8',color:'#c0504d'},{keys:['a/4'],dur:'8'},{keys:['f#/4'],dur:'h'}],[{keys:['a/4'],dur:'q',above:'A'},{keys:['b/4'],dur:'8',color:'#c0504d'},{keys:['c#/5'],dur:'8'},{keys:['a/4'],dur:'h'}],[{keys:['b/4'],dur:'8',above:'E'},{keys:['a/4'],dur:'8',color:'#c0504d'},{keys:['g#/4'],dur:'q'},{keys:['e/4'],dur:'h'}]]},
st_song_c: {key:'A', keyCount:3, beats:4, width:660, measures:[[{keys:['a/4'],dur:'q',above:'A'},{keys:['c#/5'],dur:'q'},{keys:['e/5'],dur:'h'}],[{keys:['b/4'],dur:'q',above:'E'},{keys:['g#/4'],dur:'q'},{keys:['b/4'],dur:'h'}],[{keys:['c#/5'],dur:'q',above:'F#m'},{keys:['d/5'],dur:'q',color:'#c0504d'},{keys:['c#/5'],dur:'h'}],[{keys:['d/5'],dur:'q',above:'D'},{keys:['a/4'],dur:'q'},{keys:['f#/4'],dur:'h'}]]},
};
