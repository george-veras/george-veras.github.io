# WCAG 2.2 Level AA evaluation

This is the evidence behind the claim in [accessibility.html](https://george-veras.github.io/accessibility.html):
every Level A and AA success criterion of [WCAG 2.2](https://www.w3.org/TR/WCAG22/), with its result
and what the result rests on.

**Evaluated:** 23 September 2026.

**Pages in scope:** the home page `https://george-veras.github.io/` in each of its three languages
(English, French and Portuguese, switched on the page), the web résumé `resume.html`, and the
statement `accessibility.html`. **Not in scope:** the three PDF résumés.

**Technologies relied upon:** HTML, CSS, JavaScript, WAI-ARIA.

## How it was evaluated

1. **Automated, on every push and pull request.** [`a11y/check.mjs`](a11y/check.mjs), run by
   [the accessibility workflow](workflows/a11y.yml), drives Chromium through five page states (the
   home page in three languages, the résumé, the statement) and checks:
   axe-core with the tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa` and `wcag22aa`; reflow at 320
   CSS pixels; text at 200 percent; the text spacing overrides of 1.4.12; 24 pixel targets; every
   tab stop showing a visible change with real keyboard focus; the skip link being the first stop
   and moving focus; no keyboard trap; the pause controls stopping what moves; untranslated English
   being marked as English; accessible names following the translation; and contrast for text on
   gradients, which axe-core cannot compute.
2. **The checks were made to fail on purpose.** Lightening the button gradient back to its old
   colours, switching off the English marking, and removing the focus target of the skip link
   produced seven failures, one for each thing broken. A check that has never failed proves little.
3. **By hand**, criterion by criterion, below. Automated testing finds roughly a third of what WCAG
   asks for, so most rows rest on reading the markup and driving the page.

## 1. Perceivable

| Criterion | Level | Result | Evidence |
|---|---|---|---|
| 1.1.1 Non-text Content | A | pass | The four images have alternative text that says what they show: the portrait and three eCNH screenshots. The CSS replica of a Brazilian licence is a `role="img"` with a translated `aria-label`; its canvas and inner text sit inside it, out of the accessibility tree. Decorative SVG icons are `aria-hidden`. The W3C logo uses W3C's own alternative text. |
| 1.2.1 Audio-only and Video-only (Prerecorded) | A | n/a | No audio or video. |
| 1.2.2 Captions (Prerecorded) | A | n/a | No audio or video. |
| 1.2.3 Audio Description or Media Alternative (Prerecorded) | A | n/a | No audio or video. |
| 1.2.4 Captions (Live) | AA | n/a | No live media. |
| 1.2.5 Audio Description (Prerecorded) | AA | n/a | No audio or video. |
| 1.3.1 Info and Relationships | A | pass | One `h1` per page, `h2` per section, `h3` below them. Sections are landmarks named by their own headings through `aria-labelledby`, so their names follow the translation. The résumé's skills table marks its row labels as `th scope="row"`; the statement's claim is a `dl`. axe-core finds no violation in any of the five page states. |
| 1.3.2 Meaningful Sequence | A | pass | DOM order is reading order. No CSS `order` or reversed flex anywhere. |
| 1.3.3 Sensory Characteristics | A | pass | No instruction depends on shape, size, position or sound. |
| 1.3.4 Orientation | AA | pass | No orientation lock. |
| 1.3.5 Identify Input Purpose | AA | n/a | No form inputs. |
| 1.4.1 Use of Color | A | pass | Links inside text are underlined: the footer's page links, the statement's links, and on screen the résumé's contact links, which were distinguished by colour alone before 23 September 2026. The active language is also `aria-pressed` and a filled button; the current carousel slide is also larger, and says so in its name. |
| 1.4.2 Audio Control | A | n/a | Nothing plays audio. |
| 1.4.3 Contrast (Minimum) | AA | pass | axe-core checks every solid pair. For text on gradients, which it cannot compute, CI computes every gradient stop: white on the button gradient is at least 4.63:1 (it was 3.21:1 before the gradient was darkened on 23 September 2026); the GVV logo is 19.2px bold, which is large text, at 3.83:1 against 3:1; the gradient surname is 72px at 3.83:1. Muted text is at least 6:1, including over the hero's glow. |
| 1.4.4 Resize Text | AA | pass | Text at 200 percent on all five page states, checked for clipped or lost text in CI. |
| 1.4.5 Images of Text | AA | pass | The only text in images is in the eCNH screenshots, which are pictures of an app's screens: the text is part of a picture with significant other visual content, which the criterion excepts, and each is described in its alternative text. The licence replica is real text styled with CSS. |
| 1.4.10 Reflow | AA | pass | All five page states reflow at 320 CSS pixels without sideways scrolling, checked in CI. The résumé's skills table used to push the page 53 pixels sideways; its label column now wraps at narrow widths. |
| 1.4.11 Non-text Contrast | AA | pass | The focus ring is a 3px `#00d4b4` outline, about 10:1 on the page. Inactive carousel dots are 55% white on the caption shade, about 6:1 (30% before, about 2.5:1). The carousel's arrow and pause glyphs stay above 3:1 on their darkened circles even over the brightest image, and the typewriter's pause glyph is about 6:1. |
| 1.4.12 Text Spacing | AA | pass | The four overrides the criterion specifies, on all five page states, checked for clipping in CI. |
| 1.4.13 Content on Hover or Focus | AA | pass | Nothing appears on hover or focus. The download and LinkedIn menus open on a click or Enter and close with Escape. The two `title` attributes, on the pause button and the W3C logo link, produce tooltips the browser controls, which the criterion does not cover. |

## 2. Operable

| Criterion | Level | Result | Evidence |
|---|---|---|---|
| 2.1.1 Keyboard | A | pass | Every control is a native link or button. The menus open with Enter, take Tab into their links, and close with Escape, returning focus to their button. The carousel moves with its buttons and with the arrow keys while focus is inside it. |
| 2.1.2 No Keyboard Trap | A | pass | Tabbing through each page comes back to the first stop: 43 stops on the home page, 8 on the résumé, 19 on the statement. Checked in CI. |
| 2.1.4 Character Key Shortcuts | A | n/a | No character key shortcuts. Arrow keys act only with focus inside the carousel, and Escape only on an open menu. |
| 2.2.1 Timing Adjustable | A | n/a | No time limits. |
| 2.2.2 Pause, Stop, Hide | A | pass | Everything that moves by itself can be paused. The typewriter, its blinking cursor and the scroll arrow have a pause button beside them, added on 23 September 2026, which starts paused when the system asks for reduced motion and remembers the visitor's choice; the word being typed has a fixed width so the button does not move. The carousel has its own pause button and also stops while hovered or focused; a bug that let a manual move restart a paused carousel was fixed the same day. The counters animate once, in 1.8 seconds. All checked in CI. |
| 2.3.1 Three Flashes or Below Threshold | A | pass | Nothing flashes. The cursor blinks 1.25 times a second, and pauses with the rest. |
| 2.4.1 Bypass Blocks | A | pass | A translated skip link is the first stop on the home page and on the statement, and using it puts focus on the main content rather than only scrolling; before 23 September 2026 it only scrolled. The résumé has no repeated block before its content, and its sections have headings. |
| 2.4.2 Page Titled | A | pass | Every page has a descriptive title; the home page's follows the chosen language. |
| 2.4.3 Focus Order | A | pass | Focus follows reading order. No positive `tabindex` anywhere. |
| 2.4.4 Link Purpose (In Context) | A | pass | Link text or its context says where each goes. Press links name the outlet and say they open a new tab; icon links carry names. |
| 2.4.5 Multiple Ways | AA | pass | The home page links to every page, and every page lists all three in its footer. |
| 2.4.6 Headings and Labels | AA | pass | Headings and labels describe their topic or purpose, in each language. |
| 2.4.7 Focus Visible | AA | pass | Every tab stop on every page changes visibly under keyboard focus: CI compares each stop's style focused and at rest. The site uses `:focus-visible` with a 3px outline. |
| 2.4.11 Focus Not Obscured (Minimum) | AA | pass | `scroll-padding-top` keeps focused elements and anchor targets below the 67px fixed navigation. Tabbing backwards from the bottom of the home page leaves no stop hidden under it. |
| 2.5.1 Pointer Gestures | A | n/a | No path-based or multipoint gestures; nothing listens for touch or drag. |
| 2.5.2 Pointer Cancellation | A | pass | Every action runs on click, through native buttons and links. The licence replica tilts with the pointer, which triggers nothing. |
| 2.5.3 Label in Name | A | pass | Where a name differs from the visible text it contains it: "EN, switch to English", "LinkedIn profile, choose language", "Download resume, choose language", "GitHub profile (opens in new tab)". The language buttons' names did not contain "EN", "FR" or "PT-BR" before 23 September 2026. The Portuguese and French names still contain their visible text. Icon-only buttons have no visible text label. |
| 2.5.4 Motion Actuation | A | n/a | Nothing responds to device motion. |
| 2.5.7 Dragging Movements | AA | n/a | Nothing is dragged. |
| 2.5.8 Target Size (Minimum) | AA | pass | Every target is at least 24 by 24 CSS pixels, checked in CI; the carousel dots were 8 by 8 before 23 September 2026 and now have a 24 pixel target around the same mark. The exception is the résumé's contact links, which sit in a line of text (the criterion's inline exception) and are well over 24 pixels apart. |

## 3. Understandable

| Criterion | Level | Result | Evidence |
|---|---|---|---|
| 3.1.1 Language of Page | A | pass | The `html` element's `lang` matches the language on screen and changes with the language buttons (`en`, `fr`, `pt-BR`). The résumé and the statement are `lang="en"`. |
| 3.1.2 Language of Parts | AA | pass | Content with no translation, mostly the detailed work history and the quotes, is marked `lang="en"` when the page loads, so it is identified in the French and Portuguese versions too; before 23 September 2026, 168 such passages were read with Portuguese or French rules. Language names in the menus carry their own language, and the statement's sections are marked `fr` and `pt-BR`. CI fails if untranslated English is left unmarked. |
| 3.2.1 On Focus | A | pass | Nothing changes context on focus. The carousel pauses when focused, which is not a change of context. |
| 3.2.2 On Input | A | pass | No input changes context. The language buttons act only when pressed. |
| 3.2.3 Consistent Navigation | AA | pass | The footer's list of pages appears on all three pages in the same order: Portfolio, Résumé, Accessibility statement. The top navigation exists only on the home page. |
| 3.2.4 Consistent Identification | AA | pass | Components with the same function are identified the same way on every page: the W3C logo, the footer's page links. |
| 3.2.6 Consistent Help | A | pass | Judgement call, explained below. The home page's contact section and the statement's feedback section both come at the end of the content. |
| 3.3.1 Error Identification | A | n/a | No forms. |
| 3.3.2 Labels or Instructions | A | n/a | No forms. |
| 3.3.3 Error Suggestion | AA | n/a | No forms. |
| 3.3.4 Error Prevention (Legal, Financial, Data) | AA | n/a | No forms. |
| 3.3.7 Redundant Entry | A | n/a | No multi-step process. |
| 3.3.8 Accessible Authentication (Minimum) | AA | n/a | No authentication. |

## 4. Robust

| Criterion | Level | Result | Evidence |
|---|---|---|---|
| 4.1.2 Name, Role, Value | A | pass | Native elements carry their own roles. The menu buttons expose `aria-expanded`, and since 23 September 2026 no longer claim `aria-haspopup`, which promised a menu widget they are not. Language buttons expose `aria-pressed`. The carousel is a named region with named slides; its dots are buttons named "Go to slide N", no longer tabs without the tab pattern behind them. The pause buttons' names say what pressing them will do. axe-core finds no violation. |
| 4.1.3 Status Messages | AA | pass | A language change is announced through a polite live region, in the new language. The carousel caption is a live region only while the carousel is paused, so automatic rotation does not interrupt a screen reader wherever it is reading. |

## Judgement calls

- **3.2.6 Consistent Help and the résumé.** The résumé starts with contact details because that is
  what a résumé is; this evaluation treats that line as the document's own content rather than a
  help mechanism. The two pages that offer help, the home page's contact section and the
  statement's feedback section, both place it at the end of the content.
- **1.4.5 and the eCNH screenshots.** They are photographs of an app's screens. The text in them is
  part of pictures with significant other visual content, which the criterion excepts.
- **2.5.8 and the résumé's contact links.** They are 15 pixels tall, inside a line of text, which the
  criterion's inline exception covers; they are also far enough apart to meet its spacing
  exception.
- **The licence replica is focusable.** It is a `role="img"` with `tabindex="0"`. That adds one tab
  stop to something that is not a control, which is not a failure but is noted here.

## What this does not cover

- No testing with assistive technology. No screen reader was used, and no disabled person has
  tested the site. Structure was verified in the accessibility tree and by driving a browser, which
  is not the same as listening to it.
- No independent audit.
- The PDF résumés.
