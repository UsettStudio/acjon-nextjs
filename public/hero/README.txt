NORDIC BLUEPRINT -> HOUSE  |  scroll hero assets
================================================

  frames/         frame_0001.jpg .. frame_0144.jpg   1600x900   desktop
  frames-mobile/  frame_0001.jpg .. frame_0144.jpg    800x450   mobile / slow links
  poster-first.jpg / poster-last.jpg                  LCP posters

USE
  Put frames/ next to hero-scroll.html and open it. That is all.
  FRAME_COUNT is already 144. For the light set, point FRAME_BASE at
  './frames-mobile/', or swap it at a media-query breakpoint.

TIMING
  The sequence is retimed, not a straight 24 fps dump. Equal scroll distance =
  roughly equal visual change, so scrubbing feels linear:

     0%  drawing            (source frame 1)
    25%  lines standing up  (source frame 41)
    50%  volumes solid      (source frame 61)
    75%  materials landing  (source frame 86)
   100%  finished house     (source frame 145)

  The mp4 keeps the original un-retimed 24 fps timing if you would rather use
  that or re-slice it yourself.
