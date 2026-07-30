document.addEventListener("DOMContentLoaded", function() {
  var wrapper = document.getElementById("backinstock-wrapper");
  if (!wrapper) return;

  var shop = wrapper.getAttribute("data-shop");
  var productTitle = wrapper.getAttribute("data-product-title");
  var productHandle = wrapper.getAttribute("data-product-handle");
  var available = wrapper.getAttribute("data-available");

  if (available === "true") return;

  fetch("/apps/backinstock-notifier/api/settings?shop=" + shop)
    .then(function(res) { return res.json(); })
    .then(function(settings) {
      var currentPlan = settings.currentPlan;
      var subscriberCount = settings.subscriberCount;
      var cap = 50;
      if (currentPlan === "basic") cap = 500;
      else if (currentPlan === "pro") cap = Infinity;

      if (subscriberCount >= cap) {
        wrapper.innerHTML = "<p>Notifications currently unavailable</p>";
        return;
      }

      var containerStyle = "padding:24px;display:flex;flex-direction:column;gap:12px;font-family:sans-serif;";
      var inputStyle = "padding:10px;width:100%;box-sizing:border-box;";
      var btnStyle = "padding:12px 16px;cursor:pointer;width:100%;";
      var titleStyle = "margin:0 0 8px 0;font-size:18px;font-weight:600;color:inherit;";

      var tpl = settings.selectedTemplate || "minimal";

      if (tpl === "minimal") {
        containerStyle += "border:1px solid #e1e3e5;border-radius:4px;background-color:#fff;color:#000;";
        inputStyle += "border:1px solid #c9cccf;border-radius:4px;";
        btnStyle += "border:none;background-color:#202223;color:#fff;border-radius:4px;";
      } else if (tpl === "bold") {
        containerStyle += "border:4px solid #000;background-color:#fff;color:#000;";
        inputStyle += "border:2px solid #000;font-weight:bold;font-size:16px;";
        btnStyle += "border:2px solid #000;background-color:#000;color:#fff;font-weight:bold;text-transform:uppercase;font-size:16px;";
        titleStyle += "text-transform:uppercase;font-weight:900;";
      } else if (tpl === "elegant") {
        containerStyle += "border-radius:12px;background-color:#fdfbf7;box-shadow:0 10px 30px rgba(0,0,0,0.08);color:#4a3f39;";
        inputStyle += "border:1px solid #e0dcd3;border-radius:24px;background-color:#fff;padding:12px 16px;";
        btnStyle += "border:none;background-color:#6b5b52;color:#fff;border-radius:24px;font-size:16px;";
        titleStyle += "font-family:serif;font-style:italic;color:#4a3f39;font-size:20px;text-align:center;";
      } else if (tpl === "dark") {
        containerStyle += "border:1px solid #444;border-radius:8px;background-color:#111213;color:#fff;";
        inputStyle += "border:1px solid #555;border-radius:4px;background-color:#202123;color:#fff;";
        btnStyle += "border:none;background-color:#fff;color:#111213;border-radius:4px;font-weight:bold;";
      }

      var formHtml = "<form id='backinstock-form' style='" + containerStyle + "'>";
      formHtml += "<h3 style='" + titleStyle + "'>" + settings.formTitle + "</h3>";
      formHtml += "<input type='email' id='backinstock-email' placeholder='Enter your email' required style='" + inputStyle + "'/>";
      formHtml += "<button type='submit' style='" + btnStyle + "'>" + settings.buttonText + "</button>";
      formHtml += "</form>";
      formHtml += "<div id='backinstock-msg' style='margin-top:10px;display:none;'></div>";

      wrapper.innerHTML = formHtml;

      var form = document.getElementById("backinstock-form");
      var msgDiv = document.getElementById("backinstock-msg");

      form.addEventListener("submit", function(e) {
        e.preventDefault();
        var email = document.getElementById("backinstock-email").value;

        fetch("/apps/backinstock-notifier/api/subscribe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            shop: shop,
            email: email,
            productTitle: productTitle,
            productHandle: productHandle
          })
        })
        .then(function(res) { return res.json(); })
        .then(function(data) {
          if (data.success) {
            form.style.display = "none";
            msgDiv.style.display = "block";
            msgDiv.innerHTML = settings.successMessage;
          } else if (data.message === "Already subscribed") {
            msgDiv.style.display = "block";
            msgDiv.innerHTML = "You are already subscribed";
          } else if (data.message === "Notifications unavailable") {
            form.style.display = "none";
            msgDiv.style.display = "block";
            msgDiv.innerHTML = "Notifications currently unavailable";
          } else {
            msgDiv.style.display = "block";
            msgDiv.innerHTML = "Something went wrong, please try again";
          }
        })
        .catch(function() {
          msgDiv.style.display = "block";
          msgDiv.innerHTML = "Something went wrong, please try again";
        });
      });
    })
    .catch(function(e) {
      console.error(e);
    });
});
