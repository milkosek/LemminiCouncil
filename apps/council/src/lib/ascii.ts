/**
 * ASCII art for the easter eggs. Original drawings: the Council seal and its lemmings.
 * Kept as String.raw so the backslashes stay as drawn.
 */

export const SEAL = String.raw`      _.------._
    .'   ____   '.
   /    /    \    \
  |    |  LC  |    |
   \    \____/    /
    '._        _.'
       '------'`;

/** The 404 scene: three lemmings march off the cliff; one turns back to look for your page. */
export const ARCHIVE_404 = String.raw`  .-----------------------------------------.
  |  COUNCIL ARCHIVES · DRAWER 404 · EMPTY  |
  '-----------------------------------------'

    <o            ?           o>   o>   o>
    /|                        |\   |\   |\
    / \                       / \  / \  / \
  ________________________________________
                                          |
                                          |`;

/**
 * The dissenter who walks across the screen after the Konami code.
 * Built from lines because a template literal can't end on a backslash: even in String.raw,
 * a backslash right before the closing backtick escapes it.
 */
export const DISSENTER = ['<o', '/|', '/ \\'].join('\n');
