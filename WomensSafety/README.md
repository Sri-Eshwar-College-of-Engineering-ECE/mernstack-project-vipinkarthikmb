WomensSafety:

The Women's Safety System is an advanced application and web-based platform designed to enhance public safety for women through video surveillance, harassment detection, and real-time alert mechanisms. This project combines a Python-based application with a Tkinter GUI and a fully developed website to provide a comprehensive solution for monitoring and responding to harassment incidents. The system leverages machine learning and AI models, including trained deep learning models (`harrassment_detection_model.h5` and `non_harassment_model.h5`), to analyze video files and detect harassment activities. OpenCV is utilized for video preprocessing, where frames are extracted for analysis.

The workflow begins with the user uploading a video through the Tkinter interface or the website. The video is processed frame-by-frame to detect any signs of harassment. For real-time implementation, the system can be integrated with CCTV feeds to continuously monitor public spaces. If harassment activity is detected, the system immediately sends an alert that is displayed on the website. This alert is accessible by a centralized police control room, enabling authorities to respond quickly to incidents. The website also provides an intuitive dashboard for monitoring alerts, managing reports, and tracking incident history.

The web platform serves as the primary interface for authorities, offering tools to view live alerts and analyze trends based on historical data. Users can report unsafe areas or upload videos for analysis directly through the website. With its modular design, the system allows for future enhancements, such as improved analytics, additional AI models, and expanded user functionalities.

This project combines desktop and web solutions into a cohesive system aimed at empowering women and improving public safety. The repository contains all necessary files, including the trained AI models, video processing scripts, Tkinter GUI components, and website code, making it a complete and scalable tool for addressing women's safety challenges.




