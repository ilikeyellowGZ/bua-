# Bua Reference Audit

Audit date: 2026-08-21
Contract: twenty supplied mobile screens and three supplied brand/mascot boards

## Intake result

- All 23 PNGs are present under `design/reference/bua/`.
- SHA-256 was measured before and after relocation; all 23 values match byte-for-byte.
- All sources use 8-bit PNG color type 2 (truecolor RGB) and have no alpha channel.
- The generated contact sheet at `design/audit/bua-reference-contact-sheet.png` was reviewed after generation and contains all twenty screens in numerical order.
- The references are immutable inputs. They may be read, measured, and compared, but never overwritten or used as interactive screen backgrounds.

## Global visual measurements

- Screen widths range from 852 to 887 pixels; heights range from 1774 to 1846 pixels.
- Nineteen screens are approximately 0.462 portrait aspect ratio; Page 02 is slightly wider at 0.500.
- Primary light surfaces use warm paper. Pages 06, 07, 16, and 18 use the immersive navy lesson surface.
- Primary actions sit in the lowest reachable 10–13% of the screen and are full-width rounded controls.
- Typical side gutters are 5–8% of the source width. Large cards use roughly 20–32-pixel visual radii at source scale.
- Progress/close navigation occupies the top 4–10%; fixed bottom tabs, where present, occupy the final 8–10%.

## Per-screen region ledger

Percentages are measured macro bands from the supplied raster and are implementation guides, not crop instructions.

| Page | Reference           | Measured macro regions                                                                                              | Fidelity-critical elements                                               |
| ---- | ------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| 01   | Welcome             | status 0–4%; brand 6–31%; Thandi 34–69%; actions 75–94%                                                             | wordmark, full-body Thandi, botanical ground, two CTAs, institution link |
| 02   | Goal                | navigation 2–8%; peeking Thandi 9–23%; sheet 22–98%                                                                 | four goal rows, selected teal state, sun CTA                             |
| 03   | Learn home          | header 2–17%; featured lesson 19–48%; path 51–91%; tabs 92–100%                                                     | greeting, featured card, unit states, quick review, four tabs            |
| 04   | Listening story     | progress 2–8%; label 9–14%; scene 15–60%; transcript 63–84%; action 90–98%                                          | exact scene crop, two audio lines, slow audio, continue                  |
| 05   | Comprehension       | progress 2–8%; prompt 10–23%; scene/audio 23–47%; answers 49–75%; feedback 77–90%                                   | Lerato crop, replay, selected answer, Thandi feedback                    |
| 06   | Sound focus         | progress 2–8%; coach/prompt 8–29%; waveform 31–50%; choices 52–78%; actions 81–98%                                  | dark surface, exact Thandi head, audio state, cream choices              |
| 07   | Speaking feedback   | progress 2–9%; prompt/Thandi 9–31%; recorder 33–57%; feedback 62–85%; actions 88–97%                                | coaching pose, phrase scale, waveform, three-part feedback               |
| 08   | Role-play           | progress 2–8%; title 9–18%; scene 19–51%; prompt 54–69%; choices 71–89%; action 91–98%                              | campus scene, prompt cards, exact reply choices                          |
| 09   | Complete            | title 8–22%; celebration 23–55%; metrics 58–76%; unlock 79–87%; actions 89–98%                                      | celebratory Thandi, Aloe bubble, botanicals, metrics                     |
| 10   | Practice library    | header/search 2–18%; categories 19–24%; feature 26–47%; articles 50–72%; packs 74–91%; tabs 92–100%                 | featured taxi card, cultural cards, downloads, Practice tab              |
| 11   | Language            | navigation 2–8%; intro 9–20%; language grid 21–63%; reasons 66–82%; action 91–98%                                   | six illustrated choices, single language, multi-reason chips             |
| 12   | Routine             | navigation 2–8%; intro/Thandi 9–24%; duration 28–57%; reminder 60–84%; action 91–98%                                | duration state, native-time boundary, weekday toggles                    |
| 13   | Placement           | navigation 2–8%; Thandi 10–40%; prompt 42–51%; choices 53–78%; action 90–98%                                        | pointing pose, three level choices, selected state                       |
| 14   | Phrase builder      | progress 2–8%; heading/audio 9–31%; sentence workspace 33–62%; token bank 65–78%; actions 89–98%                    | stable tokens, dashed target, clear/check controls                       |
| 15   | Picture match       | progress 2–8%; word/audio 9–22%; image grid 23–68%; feedback 70–83%; action 90–98%                                  | `amanzi`, four concepts, correct state, Thandi/botanical accent          |
| 16   | Conversation        | progress 2–8%; prompt/Thandi 9–18%; scene 19–43%; dialogue 45–55%; replies 57–78%; actions 80–98%                   | taxi-rank scene, speech cards, translation/speech controls               |
| 17   | Dictation           | progress 2–8%; coach/prompt 9–22%; playback 24–39%; input 42–57%; help 59–69%; keyboard/action 70–100%              | text draft, reveal/slow audio, keyboard-safe CTA                         |
| 18   | Click pronunciation | progress 2–8%; title/coach 9–23%; diagram 25–46%; waveforms 48–66%; recorder 68–86%; action 89–98%                  | static mouth diagram, recorded comparison, live labels                   |
| 19   | Premium offer       | close/title 2–16%; Thandi/brand 10–34%; benefit card 35–65%; social proof 67–80%; CTAs 82–98%                       | exact premium hierarchy, no fake product metadata                        |
| 20   | Checkout            | navigation/security 2–9%; Thandi/brand 9–22%; plans 23–43%; payment 45–68%; price/trial 70–83%; action/legal 85–99% | plan switch, native-store boundary, trial and legal copy                 |

## Implementation constraints discovered

1. Thandi, the wordmark, app icon, avatar, and board elements cannot currently be extracted with genuine transparency because the checkerboard is part of the RGB pixel data.
2. Crop coordinates are recorded in `mascot-crops.json`, but derived product sprites remain intentionally ungenerated until a transparent approved source is supplied or a pixel-altering mask is explicitly approved.
3. No licensed font files, audio clips, native purchase metadata, or independently layered scene art were supplied. Those gaps are tracked in `ASSET_GAPS.md` and must not be disguised with invented visual substitutes.
