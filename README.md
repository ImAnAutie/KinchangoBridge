

# Kinchango
Kinchbus/trentbarton smart card website api bridge

This bridge enables mobile apps to be written that interact with the Kinchbus Kinchkard/trentbarton Mango smart card websites.

Currently working features are
* Sign in
* Profile information fetching
* List of cards
* List of journeys on a card

It appears that you cannot have multiple sessions for a single MangoUser_ID open at any one time,signing in somewhere else
when you have an open session invalidates any old MangoUser_Token's




N.B As I Gregory Oakley-Stevenson only use Kinchbus services most of this code is only tested on the Kinchkard system
However as both systems appear to be running the same software it should work for trentbarton.
If trentbarton/kinchbus/wellglade or anyone else wants to contact me feel free to drop an email gregory@okonetwork.org.uk
If an in person meeting is required for whatever reason I am able to travel across trentbartonland/kinchbus universe :)
