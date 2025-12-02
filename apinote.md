NOTE, all apis always need access_token which is generated from meta app

API:

***PAGE API
**GET PAGE INFO
URL: https://graph.facebook.com/v24.0/me/accounts


***POST API
***PUBLISH POSTS
To publish a post to a Page, send a POST request to the /page_id/feed endpoint, where page_id is the ID for your Page, with the following parameters:

message set to the text for your post
link set to your URL if you want to post a link
published set to true to publish the post immediately (default) or false to publish later
Include scheduled_publish_time if set to false with the date in one of the following formats:
An integer UNIX timestamp [in seconds] (e.g. 1530432000)
An ISO 8061 timestamp string (e.g. 2018-09-01T10:15:30+01:00)
Any string otherwise parsable by PHP's strtotime() (e.g. +2 weeks, tomorrow)
Notes about scheduled posts
The publish date must be between 10 minutes and 30 days from the time of the API request.
If you are relying on strtotime()'s relative date strings you can read-after-write the scheduled_publish_time of the created post to make sure it is what is expected.

METHOD: POST
URL: https://graph.facebook.com/v24.0/page_id/feed
HEADER: Content-Type: application/json
BODY: {
           "message":"your_message_text",
           "link":"your_url",
           "published":"false",
           "scheduled_publish_time":"unix_time_stamp_of_a_future_date",
       }

RESPONSE: {
  "id": "page_post_id" 
}


***Get Posts
To get a list of Page posts, send a GET request to the /page_id/feed endpoint.

Example Request
Formatted for readability. Replace bold, italics values, such as page_id, with your values.
curl -i -X GET "https://graph.facebook.com/v24.0/page_id/feed"
On success, your app receives the following JSON response with an array of objects that include the post ID, the time the post was created, and the content for the post, for each post on your Page:

{
  "data": [
    {
      "created_time": "2019-01-02T18:31:28+0000",
      "message": "This is my test post on my Page.",
      "id": "page_post_id"
    }
  ],
...
}
Limitations
Live Videos - If a Page post contains a video that has expired, such as a live broadcast, you can get some post fields but not fields related to the video. The video has its own privacy rules. If the video has expired, you must be the page admin to view its information.
Message CTA - Any access token can be used to request publicly shared Page posts as long as your app has been approved for the Page Public Content Access Feature. However, posts with message CTAs cannot be accessed using another Page's access token since pages cannot message other pages.
Page Post URLs
The URL, or permalink, for a Page post is https://www.facebook.com/page_post_id.

accesstoken_instagram: IGAAMgtXyObzJBZAFFEVEdJV1IwNWRhdmdIaVVLT284bVJXS2xkbVpuNmRvZAF9YVjRiNXZACZAWo0ZAXkxMklOTGdLZAVpxaDhVb2JSVUlRdFEyOXBDR2gyRklBNFA5MWQ4eFBwb04wRkZACVWY2WEhBUDJPZA3g1N3RjTUxqMjI2U3huMAZDZD
account: 17841478892053877
pageid: 904476309412923
instagramid: 17841478892053877

https://scontent.cdninstagram.com/v/t51.82787-15/590512087_18090162032508189_3871989408689443276_n.jpg?stp=dst-jpg_e35_tt6&_nc_cat=101&ig_cache_key=Mzc3NTc1NjA4NTU0NzQzOTA0Ng%3D%3D.3-ccb7-5&ccb=7-5&_nc_sid=58cdad&efg=eyJ2ZW5jb2RlX3RhZyI6InhwaWRzLjE0NDB4MTc5OC5zZHIuQzMifQ%3D%3D&_nc_ohc=-Ew2jfc3JJwQ7kNvwGYs1bP&_nc_oc=AdlMYTs-Atr8LBWLMoFSKdk18EZGYZrcz7kyGrrfkNrb1bbHVDax6FTw6zoYFJRCltQ&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent.cdninstagram.com&_nc_gid=eyBpqgDuND7RH12AlSy_sA&oh=00_AfifOqS9pYEJuy_S3N3_4YzWklG_8A7vY-0Ec75pvg5cmQ&oe=6931CC3D

image uploaded id: 17842967991629736
                   17842968513629736

media_publish_id: 17902922076167112

