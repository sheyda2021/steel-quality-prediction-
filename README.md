# 🏗️ Steel Quality Prediction using Ensemble Learning

## 📝 Overview
This repository contains a high-performance machine learning pipeline designed to predict the **quality score** of steel products. In the manufacturing industry, predicting quality based on production parameters like temperature and cooling rate is crucial for reducing defects and optimizing processes.

The project was developed for a Kaggle competition hosted by **Mohammad Saeid**.

## 🚀 Key Features
- **Advanced Feature Engineering:** Extraction of time-based features (hour, weekday, weekend) and domain-specific interactions (e.g., Temperature/Time ratio).
- **Automated Hyperparameter Tuning:** Used **Optuna** to find the most efficient parameters for Gradient Boosting models.
- **Model Stacking (Ensemble):** Combined three powerful regressors (**LightGBM**, **XGBoost**, and **CatBoost**) using a **RidgeCV** meta-model to improve generalization and reduce RMSE.
- **Robust Validation:** Implemented a 5-fold Cross-Validation strategy to ensure the model's reliability on unseen data.

## 🛠️ Tech Stack
- **Languages:** Python
- **Libraries:** Pandas, NumPy, Scikit-learn
- **Models:** LightGBM, XGBoost, CatBoost
- **Optimization:** Optuna

## 📊 Pipeline Workflow
1. **Data Preprocessing:** Handling missing values and encoding categorical variables (Machine ID, Operator ID).
2. **Feature Engineering:** Creating physical interaction features like `area_x_lum` and `temp_time_ratio`.
3. **Tuning:** Running Optuna trials to minimize RMSE.
4. **Ensembling:** Training base models on 5 folds and blending their predictions using a Ridge regressor.

## 📈 Results
The final ensemble approach focuses on minimizing the **Root Mean Squared Error (RMSE)**, providing a balanced prediction that captures complex patterns in the production line data.

## 📂 Project Structure
```text
├── notebook.ipynb      # Main analysis and modeling code
├── submission.csv      # Final predictions
└── README.md           # Project documentation

👤 Author
Sheyda Asadi
⭐️ If you found this project helpful, please consider giving it a star!
