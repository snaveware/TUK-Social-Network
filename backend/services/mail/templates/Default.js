const DEFAULT_HTML_TEMPLATE = (message) => {
  return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>TUK Social mail</title>
          <style>
            .container {
              width: 100%;
              height: 100%;
              border: 0.5px solid rgb(247,251,255);
              margin: 0 auto;
              background-color: rgb(244,247,251);
          
            }
            .email {
              width: 100%;
              margin: 0 auto;
              background-color: transparent;
              padding: 0;
            }
            .email-header {
              background-color: #C6A767;
              color: #fff;
              padding: 20px;
              text-align: center;
            }
            .email-body {
              padding: 20px;
              margin: 0 auto;
              text-align: center;
            }
            .h-60-screen{
                height: 60vh;
            }
            .email-footer {
              background-color: #C6A767;
              color: #fff;
              padding: 20px;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="email">
              <div class="email-header">
                <h1>TUK Social</h1>
              </div>
              <div class="email-body h-60-screen">
                <p>${message}</p>
              </div>
              <div class="email-footer">
                <p>Reach us at info@tuksocial.com</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
};

module.exports = DEFAULT_HTML_TEMPLATE;
