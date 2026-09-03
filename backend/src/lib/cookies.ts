import type { CookieOptions } from 'express';

export const NOM_COOKIE_JETON = 'edloc_jeton';

// Durée alignée sur l'expiration du JWT (24 h).
const DUREE_MS = 24 * 60 * 60 * 1000;

/*
 * Le jeton est transporté par un cookie httpOnly : il reste invisible au JavaScript
 * de la page, ce qui neutralise le vol de session par XSS.
 *
 * COOKIE_SAMESITE dépend de la forme du déploiement :
 *   - 'lax'  : front et API sur le même site (même domaine enregistrable,
 *              par exemple app.edloc.fr et api.edloc.fr, ou localhost en développement) ;
 *   - 'none' : front et API sur deux sites différents (sous-domaines *.up.railway.app,
 *              railway.app figurant sur la Public Suffix List). Le navigateur exige
 *              alors Secure, forcé ci-dessous.
 */
export function optionsCookieJeton(): CookieOptions {
  const sameSite = (process.env.COOKIE_SAMESITE ?? 'lax') as 'lax' | 'none' | 'strict';

  return {
    httpOnly: true,
    secure: sameSite === 'none' || process.env.COOKIE_SECURE === 'true',
    sameSite,
    path: '/',
  };
}

export function optionsCookieAvecDuree(): CookieOptions {
  return { ...optionsCookieJeton(), maxAge: DUREE_MS };
}
