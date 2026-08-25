// Temporary diagnostic endpoint — remove after debugging the empty product grid issue.
module.exports = async (req, res) => {
  var SUPABASE_URL = "https://kiuulfkrfvcagyuxwnbg.supabase.co";
  var SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpdXVsZmtyZnZjYWd5dXh3bmJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcyOTcxODcsImV4cCI6MjEwMjg3MzE4N30.X6sim5F0f9K7oIAixs5-OJ5CQedfzlmh4ZBVbiG0_Po";
  try {
    var url = SUPABASE_URL + "/rest/v1/products?select=slug,name,product_lines(slug)&order=sort_order";
    var r = await fetch(url, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: "Bearer " + SUPABASE_ANON_KEY }
    });
    var text = await r.text();
    res.status(200).json({ status: r.status, body: text });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
};
