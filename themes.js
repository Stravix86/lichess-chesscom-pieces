// Chess.com piece-set ids (as used in images.chesscomfiles.com URLs).
const THEMES = [
  ["neo", "Neo"], ["classic", "Classic"], ["wood", "Wood"], ["glass", "Glass"],
  ["alpha", "Alpha"], ["game_room", "Game Room"], ["neo_wood", "Neo Wood"],
  ["gothic", "Gothic"], ["light", "Light"], ["metal", "Metal"], ["marble", "Marble"],
  ["icy_sea", "Icy Sea"], ["nature", "Nature"], ["ocean", "Ocean"], ["sky", "Sky"],
  ["space", "Space"], ["bases", "Bases"], ["book", "Book"], ["bubblegum", "Bubblegum"],
  ["cases", "Cases"], ["club", "Club"], ["condal", "Condal"], ["dash", "Dash"],
  ["graffiti", "Graffiti"], ["lolz", "Lolz"], ["luca", "Luca"], ["maya", "Maya"],
  ["modern", "Modern"], ["newspaper", "Newspaper"], ["tigers", "Tigers"],
  ["tournament", "Tournament"], ["vintage", "Vintage"], ["8_bit", "8-Bit"],
  ["3d_wood", "3D Wood"], ["3d_staunton", "3D Staunton"], ["3d_plastic", "3D Plastic"],
  ["3d_chesskid", "3D ChessKid"]
];

const pieceUrl = (theme, code) =>
  `https://images.chesscomfiles.com/chess-themes/pieces/${theme}/150/${code}.png`;

// images: { wp: dataUrl, wn: dataUrl, ... } -> CSS overriding Lichess 2D pieces
// (board, drag ghosts, promotion choices, mini boards).
function buildCss(images) {
  const names = { p: "pawn", n: "knight", b: "bishop", r: "rook", q: "queen", k: "king" };
  const colors = { w: "white", b: "black" };
  let css = "";
  for (const [code, url] of Object.entries(images)) {
    css += `html .is2d .${names[code[1]]}.${colors[code[0]]}{background-image:url("${url}") !important}\n`;
  }
  return css;
}
