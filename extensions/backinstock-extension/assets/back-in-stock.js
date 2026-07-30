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

      var formHtml = "<form id='backinstock-form' style='";
      var tpl = settings.selectedTemplate || "minimal";

      if (tpl === "minimal") {
        formHtml += "background:#FFFFFF;border:1px solid #E0E0E0;color:#000000;border-radius:4px;font-family:sans-serif;padding:15px;";
      } else if (tpl === "bold") {
        formHtml += "background:#1A1A1A;border:none;color:#FFFFFF;border-radius:4px;font-family:sans-serif;padding:15px;";
      } else if (tpl === "elegant") {
        formHtml += "background:#FDF6F0;border:1px solid #E8D5C4;color:#5C4033;border-radius:20px;font-family:Georgia,serif;padding:15px;";
      } else if (tpl === "dark") {
        formHtml += "background:#0D0D0D;border:1px solid #00FF88;color:#FFFFFF;border-radius:6px;font-family:monospace;padding:15px;";
      }

      formHtml += "'>";
      formHtml += "<h3 style='margin-top:0; color:inherit;'>" + settings.formTitle + "</h3>";
      formHtml += "<input type='email' id='backinstock-email' placeholder='Enter your email' required style='width:100%;padding:10px;margin-bottom:10px;box-sizing:border-box;'/>";

      var btnStyle = "padding:10px 15px;border:none;cursor:pointer;width:100%;";
      if (tpl === "minimal") {
        btnStyle += "background:#000000;color:#FFFFFF;border-radius:4px;";
      } else if (tpl === "bold") {
        btnStyle += "background:#FF4444;color:#FFFFFF;border-radius:4px;";
      } else if (tpl === "elegant") {
        btnStyle += "background:#C49A6C;color:#FFFFFF;border-radius:20px;";
      } else if (tpl === "dark") {
        btnStyle += "background:#00FF88;color:#000000;border-radius:6px;";
      }

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
