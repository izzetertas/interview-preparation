import type { Category } from "./types";

export const mlFundamentals: Category = {
  slug: "ml-fundamentals",
  title: "Machine Learning Fundamentals",
  description:
    "Core ML from the ground up: learning paradigms, model evaluation, feature engineering, classical algorithms, ensemble methods, neural networks, and practical tooling with scikit-learn, pandas, and NumPy.",
  icon: "🧠",
  questions: [
    // ───── EASY ─────
    {
      id: "ml-supervised-vs-unsupervised-vs-rl",
      title: "Supervised vs unsupervised vs reinforcement learning",
      difficulty: "easy",
      question:
        "What are the three main learning paradigms in machine learning? Give a one-sentence definition and a concrete example for each.",
      answer: `| Paradigm | Definition | Example |
|----------|-----------|---------|
| **Supervised** | Learn a mapping from labeled input–output pairs. | Email spam classifier trained on emails marked spam/ham. |
| **Unsupervised** | Find structure in unlabeled data. | k-means clustering customer purchase histories into segments. |
| **Reinforcement** | An agent learns by receiving rewards/penalties from an environment. | AlphaGo learning to play Go by playing against itself. |

**Supervised** is the most commercially common paradigm (classification, regression).
**Unsupervised** is used for exploration: clustering, dimensionality reduction, anomaly detection.
**Reinforcement** shines in sequential decision problems (robotics, game-playing, recommendation systems with delayed feedback).

There is also **semi-supervised** (a small labeled set + large unlabeled set) and **self-supervised** (labels derived from the data itself, e.g., masked language modeling), which are dominant in modern deep learning.`,
      tags: ["paradigms", "fundamentals"],
    },
    {
      id: "ml-regression-vs-classification",
      title: "Regression vs classification",
      difficulty: "easy",
      question:
        "What is the difference between a regression problem and a classification problem? How does the choice affect the model output and loss function?",
      answer: `| Aspect | Regression | Classification |
|--------|-----------|----------------|
| Output | Continuous value | Discrete class label (or probability) |
| Example target | House price ($450,000) | Spam or not-spam |
| Typical loss | MSE, MAE, Huber | Cross-entropy (log loss), hinge loss |
| Final activation | Linear (no activation) | Softmax (multi-class), sigmoid (binary) |
| Evaluation | RMSE, MAE, R² | Accuracy, F1, ROC-AUC |

**Ordinal classification** (e.g., star ratings 1–5) sits between the two — outputs are discrete but ordered.

\`\`\`python
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.datasets import make_regression, make_classification

# Regression
X_r, y_r = make_regression(n_samples=500, n_features=10, noise=20, random_state=0)
reg = LinearRegression().fit(X_r, y_r)
print(reg.predict(X_r[:1]))   # e.g. [142.7]

# Classification
X_c, y_c = make_classification(n_samples=500, n_features=10, random_state=0)
clf = LogisticRegression().fit(X_c, y_c)
print(clf.predict_proba(X_c[:1]))   # e.g. [[0.08, 0.92]]
\`\`\``,
      tags: ["fundamentals", "loss-functions"],
    },
    {
      id: "ml-train-val-test-split",
      title: "Train / validation / test split",
      difficulty: "easy",
      question:
        "Why do we split data into train, validation, and test sets? What role does each set play, and what are common split ratios?",
      answer: `| Set | Purpose | Touched during training? |
|-----|---------|--------------------------|
| **Train** | The model learns parameters from this data. | Yes, every epoch |
| **Validation** | Tune hyperparameters; monitor for overfitting. | No (only read, never fit) |
| **Test** | Final, unbiased estimate of generalization error. | Never until final evaluation |

**Why three sets?** If you tune hyperparameters on the test set you leak information: the model is implicitly fit to it, so test error becomes optimistic.

Common ratios (no single truth):
- Large dataset (> 100k): 98 / 1 / 1
- Medium dataset: 70 / 15 / 15 or 80 / 10 / 10
- Small dataset: Use k-fold cross-validation instead of a separate validation set.

\`\`\`python
from sklearn.model_selection import train_test_split

X_train_val, X_test, y_train_val, y_test = train_test_split(
    X, y, test_size=0.15, random_state=42, stratify=y
)
X_train, X_val, y_train, y_val = train_test_split(
    X_train_val, y_train_val, test_size=0.176, random_state=42, stratify=y_train_val
    # 0.176 × 0.85 ≈ 0.15 → final split ≈ 70/15/15
)
\`\`\``,
      tags: ["fundamentals", "evaluation"],
    },
    {
      id: "ml-overfitting-underfitting",
      title: "Overfitting vs underfitting (bias-variance trade-off)",
      difficulty: "easy",
      question:
        "Explain overfitting and underfitting. How does the bias-variance trade-off explain them, and what techniques combat each?",
      answer: `**Bias** = error from incorrect assumptions (model too simple → underfitting).
**Variance** = error from sensitivity to small fluctuations in training data (model too complex → overfitting).

\`\`\`
Total Error ≈ Bias² + Variance + Irreducible Noise
\`\`\`

| | Underfitting (High Bias) | Overfitting (High Variance) |
|--|--|--|
| Training error | High | Low |
| Validation error | High | Much higher than train |
| Model complexity | Too low | Too high |
| Fixes | More features, larger model, less regularization | More data, regularization (L1/L2/dropout), early stopping, pruning, ensembles |

**Learning curves** are the canonical diagnostic: plot train and val error vs. training set size.
- If both plateau high → high bias.
- If val error far above train error → high variance.

\`\`\`python
from sklearn.model_selection import learning_curve
import numpy as np

train_sizes, train_scores, val_scores = learning_curve(
    estimator, X, y, cv=5, scoring="neg_mean_squared_error",
    train_sizes=np.linspace(0.1, 1.0, 10)
)
\`\`\``,
      tags: ["bias-variance", "regularization", "fundamentals"],
    },
    {
      id: "ml-accuracy-precision-recall-f1",
      title: "Accuracy, precision, recall, and F1",
      difficulty: "easy",
      question:
        "Define accuracy, precision, recall, and F1-score. When would you prefer recall over precision, and vice versa?",
      answer: `Given the confusion matrix (binary case):

|  | Predicted Positive | Predicted Negative |
|--|--|--|
| **Actual Positive** | TP | FN |
| **Actual Negative** | FP | TN |

\`\`\`
Accuracy  = (TP + TN) / (TP + TN + FP + FN)
Precision = TP / (TP + FP)          # "of predicted positives, how many are right?"
Recall    = TP / (TP + FN)          # "of actual positives, how many did we catch?"
F1        = 2 × (Precision × Recall) / (Precision + Recall)
\`\`\`

**When to prefer recall:** Medical diagnosis (missing a cancer is worse than a false alarm). High recall → fewer FN.
**When to prefer precision:** Spam filtering (sending a good email to spam is costly). High precision → fewer FP.
**Accuracy alone is misleading** on imbalanced datasets (99% negative class → 99% accuracy by predicting all-negative).

\`\`\`python
from sklearn.metrics import classification_report

print(classification_report(y_test, y_pred, target_names=["neg", "pos"]))
# Shows precision, recall, f1-score, support per class
\`\`\`

**Fβ-score** generalizes F1: \`Fβ = (1 + β²) × (P × R) / (β²P + R)\`. β > 1 favors recall; β < 1 favors precision.`,
      tags: ["evaluation", "metrics", "classification"],
    },
    {
      id: "ml-feature-normalization-standardization",
      title: "Normalization vs standardization",
      difficulty: "easy",
      question:
        "What is the difference between min-max normalization and z-score standardization? When should you use each, and how do you apply them with scikit-learn?",
      answer: `| | Min-Max Normalization | Z-score Standardization |
|--|--|--|
| Formula | \`(x − min) / (max − min)\` | \`(x − μ) / σ\` |
| Output range | [0, 1] (or custom) | Mean 0, std 1 (unbounded) |
| Sensitive to outliers? | Yes — outliers compress the rest | Less so — outliers inflate σ |
| Use when | Neural nets, distance-based models (KNN, k-means) requiring bounded inputs | Linear/logistic regression, SVM, PCA — assumes roughly Gaussian features |

**Always fit on train, transform train and test separately** to avoid data leakage.

\`\`\`python
from sklearn.preprocessing import MinMaxScaler, StandardScaler

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)   # fit + transform
X_test_scaled  = scaler.transform(X_test)         # transform only — no refit!
\`\`\`

Use a **Pipeline** to prevent leakage automatically:

\`\`\`python
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression

pipe = Pipeline([
    ("scaler", StandardScaler()),
    ("clf", LogisticRegression()),
])
pipe.fit(X_train, y_train)
pipe.score(X_test, y_test)
\`\`\``,
      tags: ["feature-engineering", "preprocessing"],
    },
    {
      id: "ml-kmeans-clustering",
      title: "k-means clustering",
      difficulty: "easy",
      question:
        "Explain the k-means algorithm step by step. What are its key assumptions and limitations, and how do you choose k?",
      answer: `**Algorithm (Lloyd's algorithm):**
1. Choose k initial centroids (random or k-means++ seeding).
2. **Assign** each point to the nearest centroid (Euclidean distance).
3. **Update** each centroid to the mean of its assigned points.
4. Repeat steps 2–3 until assignments don't change (or max iterations reached).

**Assumptions / limitations:**
- Clusters are spherical and roughly equal-sized.
- Sensitive to outliers (centroid pulled by extremes).
- Must specify k in advance.
- Non-deterministic (different runs may give different results → use multiple restarts).
- Fails on non-convex or ring-shaped clusters.

**Choosing k — the elbow method:**

\`\`\`python
from sklearn.cluster import KMeans
import numpy as np

inertias = []
K_range = range(2, 12)
for k in K_range:
    km = KMeans(n_clusters=k, n_init="auto", random_state=42)
    km.fit(X)
    inertias.append(km.inertia_)

# Plot inertias vs K — look for the "elbow" where improvement flattens
\`\`\`

**Silhouette score** is a more principled alternative: ranges from −1 to 1, higher is better.

\`\`\`python
from sklearn.metrics import silhouette_score
score = silhouette_score(X, km.labels_)
\`\`\``,
      tags: ["unsupervised", "clustering"],
    },

    // ───── MEDIUM ─────
    {
      id: "ml-cross-validation",
      title: "k-fold and stratified k-fold cross-validation",
      difficulty: "medium",
      question:
        "How does k-fold cross-validation work? Why use stratified k-fold, and how does it differ from a simple train/test split?",
      answer: `**k-fold CV:**
1. Split data into k equally-sized folds.
2. For each fold i: train on all folds except i, evaluate on fold i.
3. Average the k scores → single variance-reduced estimate of generalization error.

**Advantages over a single split:**
- Uses all data for both training and validation.
- Reduces variance of the performance estimate.
- Essential for small datasets where a single split is unreliable.

**Stratified k-fold** preserves the class proportion in each fold — critical for imbalanced classes.

\`\`\`python
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.ensemble import RandomForestClassifier

skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
scores = cross_val_score(
    RandomForestClassifier(n_estimators=100, random_state=42),
    X, y,
    cv=skf,
    scoring="f1_weighted",
)
print(f"F1: {scores.mean():.3f} ± {scores.std():.3f}")
\`\`\`

**Variants:**
| Variant | When to use |
|---------|------------|
| k-fold (k=5 or 10) | Default for most regression tasks |
| Stratified k-fold | Classification, especially imbalanced |
| Leave-One-Out (LOO) | Very small datasets (≤ ~50 samples) |
| Group k-fold | Samples are not i.i.d. (e.g., multiple rows per patient) |
| TimeSeriesSplit | Temporal data — never let future leak into past fold |`,
      tags: ["evaluation", "cross-validation"],
    },
    {
      id: "ml-roc-auc",
      title: "ROC curve and AUC",
      difficulty: "medium",
      question:
        "What is the ROC curve and what does the AUC metric represent? When is AUC a better metric than accuracy?",
      answer: `**ROC (Receiver Operating Characteristic) curve** plots **True Positive Rate (Recall)** vs **False Positive Rate** at every classification threshold from 0 to 1.

\`\`\`
TPR = TP / (TP + FN)    (sensitivity / recall)
FPR = FP / (FP + TN)    (1 − specificity)
\`\`\`

**AUC (Area Under the Curve)** summarizes the curve as a single number:
- AUC = 1.0 → perfect classifier
- AUC = 0.5 → random guessing (diagonal line)
- AUC < 0.5 → worse than random (flip predictions)

**AUC vs Accuracy:**
- AUC is **threshold-independent** — measures the model's ability to rank positives above negatives across all thresholds.
- Accuracy depends on a fixed threshold (usually 0.5) and is misleading on imbalanced data.
- AUC is preferred when: classes are imbalanced, or the optimal threshold is unknown at training time.

\`\`\`python
from sklearn.metrics import roc_auc_score, RocCurveDisplay
from sklearn.linear_model import LogisticRegression

clf = LogisticRegression().fit(X_train, y_train)
y_prob = clf.predict_proba(X_test)[:, 1]

print(f"AUC: {roc_auc_score(y_test, y_prob):.3f}")
RocCurveDisplay.from_predictions(y_test, y_prob)  # plots curve
\`\`\`

**PR-AUC** (Precision-Recall AUC) is preferred over ROC-AUC when the **positive class is rare** — ROC-AUC can be overly optimistic in that regime because it factors in the large TN pool.`,
      tags: ["evaluation", "metrics", "classification"],
    },
    {
      id: "ml-gradient-descent",
      title: "Gradient descent variants",
      difficulty: "medium",
      question:
        "Explain batch gradient descent, stochastic gradient descent, and mini-batch gradient descent. What are the trade-offs between them?",
      answer: `All three update model parameters θ by moving in the direction of steepest loss descent:
\`θ ← θ − η · ∇L(θ)\`

| Variant | Gradient computed over | Update frequency | Behavior |
|---------|----------------------|-----------------|----------|
| **Batch GD** | Entire training set | Once per epoch | Stable, exact gradient, very slow for large N |
| **Stochastic GD (SGD)** | 1 random sample | N times per epoch | Noisy, fast, can escape local minima |
| **Mini-batch GD** | Batch of B samples (typically 32–512) | N/B times per epoch | Best of both: GPU-efficient, moderately stable |

**Mini-batch is the standard in practice** — all deep learning frameworks default to it.

**Learning rate (η) matters enormously:**
- Too large → loss diverges.
- Too small → extremely slow convergence.

\`\`\`python
import numpy as np

def mini_batch_gd(X, y, lr=0.01, batch_size=32, epochs=100):
    n, d = X.shape
    theta = np.zeros(d)
    for _ in range(epochs):
        idx = np.random.permutation(n)
        for start in range(0, n, batch_size):
            batch = idx[start:start + batch_size]
            X_b, y_b = X[batch], y[batch]
            grad = (X_b.T @ (X_b @ theta - y_b)) / len(batch)
            theta -= lr * grad
    return theta
\`\`\`

**Momentum, Adam, AdaGrad, RMSProp** are adaptive extensions that accumulate gradient history to accelerate convergence and reduce oscillation.`,
      tags: ["optimization", "gradient-descent", "fundamentals"],
    },
    {
      id: "ml-decision-trees",
      title: "Decision trees — splitting criteria and pruning",
      difficulty: "medium",
      question:
        "How does a decision tree choose which feature to split on? Explain Gini impurity and information gain. How do you control overfitting?",
      answer: `A decision tree greedily selects the feature and threshold that most reduces impurity at each node.

**Gini impurity** (used by scikit-learn's CART):
\`\`\`
Gini(t) = 1 − Σ p(k|t)²
\`\`\`
Ranges from 0 (pure node) to ~0.5 (most impure for binary).

**Information gain** (entropy-based, used by ID3/C4.5):
\`\`\`
IG = H(parent) − Σ (|child| / |parent|) × H(child)
H(t) = −Σ p(k|t) log₂ p(k|t)
\`\`\`

Both criteria are equivalent in practice for most datasets — Gini is cheaper to compute (no log).

**Controlling overfitting:**
| Hyperparameter | Effect |
|----------------|--------|
| \`max_depth\` | Limits tree depth — most effective single knob |
| \`min_samples_split\` | Node must have ≥ N samples to split |
| \`min_samples_leaf\` | Each leaf must have ≥ N samples |
| \`max_features\` | Random subset of features considered per split |
| \`ccp_alpha\` | Post-pruning via minimal cost-complexity pruning |

\`\`\`python
from sklearn.tree import DecisionTreeClassifier

dt = DecisionTreeClassifier(
    max_depth=5,
    min_samples_leaf=10,
    criterion="gini",
    random_state=42,
)
dt.fit(X_train, y_train)
\`\`\``,
      tags: ["trees", "classification", "algorithms"],
    },
    {
      id: "ml-random-forests",
      title: "Random forests — bagging and feature randomness",
      difficulty: "medium",
      question:
        "How does a random forest differ from a single decision tree? Explain the role of bagging and feature subsampling, and describe the out-of-bag (OOB) error.",
      answer: `A **random forest** is an ensemble of decision trees trained with two sources of randomness that reduce variance without increasing bias:

1. **Bagging (Bootstrap Aggregating):** Each tree is trained on a bootstrap sample (~63% unique samples from training set). Predictions are aggregated by majority vote (classification) or mean (regression).

2. **Feature subsampling:** At each split, only a random subset of \`max_features\` features is considered (typically √d for classification, d/3 for regression). This decorrelates the trees — otherwise all trees would pick the same dominant feature.

**Out-of-bag (OOB) error:** The ~37% of samples not in a tree's bootstrap sample can be used as a free validation set for that tree. Averaging OOB predictions across trees gives an unbiased estimate of generalization error without needing a separate validation split.

\`\`\`python
from sklearn.ensemble import RandomForestClassifier

rf = RandomForestClassifier(
    n_estimators=500,
    max_features="sqrt",
    max_depth=None,       # trees are fully grown — bagging handles variance
    oob_score=True,
    n_jobs=-1,
    random_state=42,
)
rf.fit(X_train, y_train)
print(f"OOB accuracy: {rf.oob_score_:.3f}")

# Feature importances (mean decrease in impurity)
import pandas as pd
fi = pd.Series(rf.feature_importances_, index=feature_names).sort_values(ascending=False)
\`\`\`

**Key hyperparameters to tune:** \`n_estimators\` (more is better, diminishing returns), \`max_features\`, \`max_depth\`, \`min_samples_leaf\`.`,
      tags: ["ensembles", "trees", "bagging"],
    },
    {
      id: "ml-gradient-boosting",
      title: "Gradient boosting, XGBoost, and LightGBM",
      difficulty: "medium",
      question:
        "Explain how gradient boosting works. How do XGBoost and LightGBM improve on vanilla gradient boosting, and what are the key hyperparameters to tune?",
      answer: `**Gradient boosting** builds an ensemble sequentially. Each new tree is fit to the **negative gradient (pseudo-residuals)** of the loss with respect to the current ensemble's predictions — i.e., each tree corrects the errors of the previous ones.

\`\`\`
F₀(x) = initial prediction (e.g., mean of y)
For m = 1 … M:
  rᵢ = −∂L(yᵢ, Fₘ₋₁(xᵢ)) / ∂Fₘ₋₁(xᵢ)   # pseudo-residuals
  hₘ = fit a shallow tree to rᵢ
  Fₘ(x) = Fₘ₋₁(x) + η · hₘ(x)             # η = learning rate
\`\`\`

**XGBoost improvements over sklearn's GBM:**
- Second-order (Newton) gradient approximation — faster convergence.
- Regularization terms (L1 on leaf weights, L2 on leaf scores) built into objective.
- Column block data structure for parallel split finding.
- Handling of missing values natively.

**LightGBM improvements:**
- **Histogram-based splitting** — bins continuous features, O(B) instead of O(N) per split.
- **GOSS** (Gradient-based One-Side Sampling) — keep large-gradient samples, subsample small-gradient ones.
- **Leaf-wise tree growth** (vs. level-wise in XGBoost) — deeper trees with fewer leaves, faster for large N.

\`\`\`python
import lightgbm as lgb
from sklearn.model_selection import cross_val_score

lgbm = lgb.LGBMClassifier(
    n_estimators=1000,
    learning_rate=0.05,
    num_leaves=31,          # controls complexity (< 2^max_depth)
    subsample=0.8,
    colsample_bytree=0.8,
    reg_alpha=0.1,          # L1
    reg_lambda=1.0,         # L2
    random_state=42,
    n_jobs=-1,
)
scores = cross_val_score(lgbm, X, y, cv=5, scoring="roc_auc")
print(scores.mean())
\`\`\`

**Key hyperparameters:** \`learning_rate\` + \`n_estimators\` (inversely related), \`max_depth\`/\`num_leaves\`, \`subsample\`, \`colsample_bytree\`, regularization.`,
      tags: ["ensembles", "boosting", "xgboost", "lightgbm"],
    },
    {
      id: "ml-pca",
      title: "Principal Component Analysis (PCA)",
      difficulty: "medium",
      question:
        "Explain how PCA works geometrically and algorithmically. When would you use PCA, and what does 'explained variance ratio' mean?",
      answer: `**PCA** finds orthogonal axes (principal components) in the original feature space along which variance is maximized.

**Geometric intuition:** Think of a point cloud — PCA rotates the coordinate system so PC1 is the direction of most spread, PC2 is the next most spread (and perpendicular to PC1), and so on.

**Algorithm:**
1. Center the data: \`X̃ = X − mean(X)\`.
2. Compute the covariance matrix: \`C = X̃ᵀX̃ / (n−1)\`.
3. Eigendecompose: \`C = VΛVᵀ\` — columns of V are eigenvectors (principal components), diagonal of Λ are eigenvalues.
4. Project: \`Z = X̃ · V[:, :k]\` to reduce to k dimensions.

In practice, use **SVD** of X̃ directly (numerically stable, same result).

**Explained variance ratio:** Fraction of total variance captured by each PC.

\`\`\`python
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
import numpy as np

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

pca = PCA(n_components=0.95, random_state=42)   # retain 95% of variance
X_reduced = pca.fit_transform(X_scaled)

print(f"Reduced from {X.shape[1]} → {X_reduced.shape[1]} features")
print(f"Variance explained: {pca.explained_variance_ratio_.cumsum()[-1]:.3f}")
\`\`\`

**Use PCA when:**
- Removing multicollinearity before linear models.
- Speeding up training on high-dimensional data.
- Visualizing data (reduce to 2D/3D).

**Limitations:** PCA is linear — use t-SNE or UMAP for non-linear structure. Interpretability is lost (components are linear combinations of all features). Always scale before applying PCA.`,
      tags: ["dimensionality-reduction", "unsupervised"],
    },
    {
      id: "ml-svm-intuition",
      title: "Support Vector Machines — intuition",
      difficulty: "medium",
      question:
        "Explain the intuition behind SVMs: what is the maximum-margin hyperplane, the kernel trick, and the soft-margin C parameter?",
      answer: `**Maximum-margin hyperplane:** Among all hyperplanes that correctly separate the classes, SVM picks the one that maximizes the margin — the distance between the hyperplane and the nearest training points on each side (the **support vectors**). Larger margin → better generalization.

\`\`\`
Objective: maximize  2 / ‖w‖   (margin width)
Subject to: yᵢ(wᵀxᵢ + b) ≥ 1   for all i
\`\`\`

**Kernel trick:** When data is not linearly separable, implicitly map features to a higher-dimensional space using a kernel function K(xᵢ, xⱼ) = φ(xᵢ)·φ(xⱼ) — without ever computing φ explicitly.

| Kernel | Formula | Use case |
|--------|---------|----------|
| Linear | xᵢᵀxⱼ | Large sparse features (text) |
| RBF (Gaussian) | exp(−γ‖xᵢ−xⱼ‖²) | Most non-linear problems |
| Polynomial | (γ xᵢᵀxⱼ + r)^d | Image data |

**Soft-margin C:** Allows some misclassifications to handle noise and non-separability.
- Large C → narrow margin, fewer training errors (risks overfitting).
- Small C → wider margin, more training errors allowed (more regularization).

\`\`\`python
from sklearn.svm import SVC
from sklearn.model_selection import GridSearchCV

svc = SVC(kernel="rbf", probability=True)
grid = GridSearchCV(svc, {"C": [0.1, 1, 10], "gamma": ["scale", "auto", 0.01]}, cv=5)
grid.fit(X_train_scaled, y_train)
print(grid.best_params_)
\`\`\`

SVMs scale poorly to very large datasets (O(n²)–O(n³) training). For large n, use **LinearSVC** or logistic regression instead.`,
      tags: ["svm", "classification", "algorithms"],
    },
    {
      id: "ml-feature-encoding-missing",
      title: "Categorical encoding and missing value imputation",
      difficulty: "medium",
      question:
        "Describe the main strategies for encoding categorical variables and handling missing values. What pitfalls should you watch out for?",
      answer: `**Categorical encoding:**

| Strategy | When to use | Notes |
|----------|------------|-------|
| **One-hot encoding** | Nominal categories, low cardinality (< ~15) | Creates k−1 columns to avoid dummy trap |
| **Ordinal encoding** | Ordered categories (Low/Med/High) | Must reflect real order |
| **Target encoding** | High-cardinality nominal (zip codes, user IDs) | Prone to leakage — use CV-based or smoothed variants |
| **Binary encoding** | High cardinality without tree models | log₂(k) columns |
| **Hashing** | Very high cardinality, speed critical | Collisions possible |

**Missing value handling:**

| Strategy | When to use |
|----------|------------|
| **Mean/median imputation** | MCAR/MAR numeric features; add indicator column |
| **Mode imputation** | Categorical features |
| **KNN imputation** | When missingness is informative and N is manageable |
| **MICE / iterative imputer** | Complex missing patterns |
| **Drop rows** | Very few rows with missing values |
| **Drop columns** | > 40–60% of values missing |

\`\`\`python
import pandas as pd
import numpy as np
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OneHotEncoder, StandardScaler

num_pipe = Pipeline([
    ("imputer", SimpleImputer(strategy="median")),
    ("scaler", StandardScaler()),
])
cat_pipe = Pipeline([
    ("imputer", SimpleImputer(strategy="most_frequent")),
    ("ohe", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
])

ct = ColumnTransformer([
    ("num", num_pipe, num_cols),
    ("cat", cat_pipe, cat_cols),
])
\`\`\`

**Pitfall:** Always fit imputers/encoders on train data only. Leaking imputation statistics from the test set is a common mistake.`,
      tags: ["feature-engineering", "preprocessing", "pipelines"],
    },
    {
      id: "ml-class-imbalance",
      title: "Handling class imbalance",
      difficulty: "medium",
      question:
        "What techniques can be used to address class imbalance? Compare oversampling (SMOTE), undersampling, and class weights.",
      answer: `Class imbalance (e.g., 1% positives) causes models to default to the majority class, achieving high accuracy but poor recall on the minority.

**Strategies:**

| Technique | How it works | Pros | Cons |
|-----------|-------------|------|------|
| **Class weights** | Penalize misclassifying minority class more heavily in the loss | Simple, no data change | May not help severe imbalance |
| **Random oversampling** | Duplicate minority samples | Simple | Exact copies → overfitting |
| **SMOTE** | Synthesize new minority samples along line segments between existing ones | Avoids exact copies | Can generate noisy samples; should only be applied to train set |
| **Random undersampling** | Drop majority samples | Reduces training time | Discards potentially useful data |
| **Tomek links / Edited NN** | Remove majority samples near decision boundary | Cleans boundary | Conservative |
| **Ensemble methods** | BalancedRandomForest, EasyEnsemble | Often best results | Slower |

\`\`\`python
from imblearn.over_sampling import SMOTE
from imblearn.pipeline import Pipeline as ImbPipeline
from sklearn.ensemble import GradientBoostingClassifier

# CRITICAL: SMOTE must be inside the pipeline so it only runs on train folds
pipe = ImbPipeline([
    ("smote", SMOTE(sampling_strategy=0.5, random_state=42)),
    ("clf", GradientBoostingClassifier(random_state=42)),
])

# Using class_weight instead (simpler, often competitive):
from sklearn.linear_model import LogisticRegression
clf = LogisticRegression(class_weight="balanced")   # weights ∝ 1/class_freq
\`\`\`

**Always evaluate with F1, PR-AUC, or ROC-AUC** — not accuracy — on imbalanced problems.`,
      tags: ["class-imbalance", "smote", "evaluation"],
    },

    // ───── HARD ─────
    {
      id: "ml-neural-network-backprop",
      title: "Neural networks — layers, activations, and backpropagation",
      difficulty: "hard",
      question:
        "Describe the forward pass and backpropagation in a feedforward neural network. Explain the role of activation functions and why vanishing gradients are a problem.",
      answer: `**Forward pass:**
\`\`\`
z⁽ˡ⁾ = W⁽ˡ⁾ a⁽ˡ⁻¹⁾ + b⁽ˡ⁾     (linear transform)
a⁽ˡ⁾ = f(z⁽ˡ⁾)                   (activation function)
\`\`\`
Loss L is computed at the output layer.

**Backpropagation** applies the chain rule to compute ∂L/∂W⁽ˡ⁾ for every layer, flowing gradients from output → input:
\`\`\`
δ⁽ᴸ⁾ = ∂L/∂z⁽ᴸ⁾                          (output layer error)
δ⁽ˡ⁾ = (W⁽ˡ⁺¹⁾ᵀ δ⁽ˡ⁺¹⁾) ⊙ f′(z⁽ˡ⁾)       (hidden layer error)
∂L/∂W⁽ˡ⁾ = δ⁽ˡ⁾ (a⁽ˡ⁻¹⁾)ᵀ
\`\`\`

**Activation functions:**

| Function | Formula | Issue |
|----------|---------|-------|
| Sigmoid | 1/(1+e⁻ˣ) | Vanishing gradient for large \|x\| |
| Tanh | (eˣ−e⁻ˣ)/(eˣ+e⁻ˣ) | Same saturation problem |
| **ReLU** | max(0, x) | Dead neurons (x < 0 → gradient = 0 forever) |
| **Leaky ReLU** | max(αx, x) | Fixes dead neurons |
| **GELU** | x · Φ(x) | Smooth, used in Transformers |
| Softmax | eˣᵢ / Σeˣⱼ | Output layer for multi-class only |

**Vanishing gradients:** In deep networks with sigmoid/tanh, δ⁽ˡ⁾ shrinks exponentially as l decreases because f′ < 1. Gradients in early layers approach zero → those layers don't learn.

**Solutions:** ReLU family activations, batch normalization, residual connections (skip connections), gradient clipping, careful weight initialization (He, Xavier).

\`\`\`python
import torch.nn as nn

model = nn.Sequential(
    nn.Linear(128, 256),
    nn.BatchNorm1d(256),
    nn.GELU(),
    nn.Dropout(0.3),
    nn.Linear(256, 10),
)
\`\`\``,
      tags: ["neural-networks", "backpropagation", "deep-learning"],
    },
    {
      id: "ml-cnn",
      title: "Convolutional Neural Networks — convolution, pooling, and use cases",
      difficulty: "hard",
      question:
        "How does a convolutional layer work? Explain the roles of kernel, stride, padding, and pooling. Why are CNNs preferred over MLPs for image data?",
      answer: `**Convolution operation:** A learnable kernel (filter) of size k×k slides across the input, computing dot products at each position → produces a feature map.

\`\`\`
Output size = ⌊(W − k + 2P) / S⌋ + 1
  W = input width, k = kernel size, P = padding, S = stride
\`\`\`

**Key concepts:**

| Concept | Role |
|---------|------|
| **Kernel / filter** | Learns local features (edges, textures). Multiple filters → multiple channels. |
| **Stride S** | Step size of kernel movement. S > 1 downsamples spatial dimensions. |
| **Padding P** | "same" padding preserves spatial size; "valid" shrinks it. |
| **Pooling (max/avg)** | Reduces spatial size, introduces translation invariance, reduces parameters. |
| **Depth / channels** | Stacking layers learns hierarchical features (edges → shapes → objects). |

**Why CNNs beat MLPs on images:**
- **Parameter sharing:** One filter applied everywhere → far fewer parameters vs. a fully-connected layer over all pixels.
- **Translation equivariance:** The same filter detects a feature regardless of its position.
- **Local connectivity:** Each neuron sees only a small receptive field — respects spatial structure.

\`\`\`python
import torch.nn as nn

class SimpleCNN(nn.Module):
    def __init__(self, num_classes=10):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(3, 32, kernel_size=3, padding=1),   # 32×32×3 → 32×32×32
            nn.BatchNorm2d(32),
            nn.ReLU(),
            nn.MaxPool2d(2, 2),                            # → 16×16×32
            nn.Conv2d(32, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(),
            nn.MaxPool2d(2, 2),                            # → 8×8×64
        )
        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Linear(64 * 8 * 8, 256),
            nn.ReLU(),
            nn.Dropout(0.5),
            nn.Linear(256, num_classes),
        )

    def forward(self, x):
        return self.classifier(self.features(x))
\`\`\``,
      tags: ["cnn", "deep-learning", "computer-vision"],
    },
    {
      id: "ml-rnn-lstm",
      title: "RNNs and LSTMs — sequence modeling",
      difficulty: "hard",
      question:
        "How do RNNs process sequential data, and why do vanilla RNNs fail on long sequences? Explain how LSTMs address this with gates.",
      answer: `**Vanilla RNN:** At each time step t, the hidden state hₜ is a function of the current input and the previous hidden state:
\`\`\`
hₜ = tanh(Wₕ hₜ₋₁ + Wₓ xₜ + b)
ŷₜ = Wᵧ hₜ
\`\`\`
Trained via **Backpropagation Through Time (BPTT)**.

**Vanishing gradient in RNNs:** Gradients are multiplied by Wₕ at each time step. If ‖Wₕ‖ < 1, gradients → 0 exponentially → RNN can't learn long-range dependencies. (‖Wₕ‖ > 1 → exploding gradients, fixed by clipping.)

**LSTM** introduces a **cell state** Cₜ (long-term memory) and three gates:

| Gate | Formula | Purpose |
|------|---------|---------|
| **Forget gate** fₜ | σ(Wf·[hₜ₋₁, xₜ] + bf) | Decide what to erase from Cₜ₋₁ |
| **Input gate** iₜ | σ(Wᵢ·[hₜ₋₁, xₜ] + bᵢ) | Decide what new info to store |
| **Cell candidate** C̃ₜ | tanh(Wc·[hₜ₋₁, xₜ] + bc) | New candidate values |
| **Output gate** oₜ | σ(Wo·[hₜ₋₁, xₜ] + bo) | What to output from Cₜ |

\`\`\`
Cₜ = fₜ ⊙ Cₜ₋₁ + iₜ ⊙ C̃ₜ
hₜ = oₜ ⊙ tanh(Cₜ)
\`\`\`

The additive update to Cₜ allows gradients to flow across many time steps without multiplicative shrinkage.

\`\`\`python
import torch.nn as nn

class LSTMClassifier(nn.Module):
    def __init__(self, input_size, hidden_size, num_layers, num_classes):
        super().__init__()
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers,
                            batch_first=True, dropout=0.3)
        self.fc = nn.Linear(hidden_size, num_classes)

    def forward(self, x):
        out, _ = self.lstm(x)          # out: (batch, seq_len, hidden)
        return self.fc(out[:, -1, :])  # use last time step
\`\`\`

**GRU** (Gated Recurrent Unit) simplifies LSTM to 2 gates with similar performance in many tasks and fewer parameters.`,
      tags: ["rnn", "lstm", "sequence-modeling", "deep-learning"],
    },
    {
      id: "ml-batch-norm-dropout",
      title: "Batch normalization and dropout",
      difficulty: "hard",
      question:
        "How do batch normalization and dropout work? What problems do they solve, and what are the key differences in their behavior between training and inference?",
      answer: `**Batch Normalization:**

For each mini-batch, normalize the activations of a layer to have mean 0 and variance 1, then apply learnable scale (γ) and shift (β):
\`\`\`
μ_B = (1/m) Σ xᵢ
σ²_B = (1/m) Σ (xᵢ − μ_B)²
x̂ᵢ = (xᵢ − μ_B) / √(σ²_B + ε)
yᵢ = γ x̂ᵢ + β
\`\`\`

**What it solves:**
- **Internal covariate shift:** Layer inputs shift as earlier layers update → slows training. BN re-centers each mini-batch.
- Allows higher learning rates, reduces sensitivity to weight initialization.
- Acts as mild regularizer (due to batch noise).

**Training vs inference:** During training, uses batch mean/variance. During inference, uses **running statistics** (exponential moving average accumulated during training) — no randomness, deterministic output.

---

**Dropout:**

At each forward pass during training, randomly zero out each neuron's activation with probability p (typically 0.1–0.5). Remaining activations are scaled by 1/(1−p) to preserve expected values (**inverted dropout**).

\`\`\`
Training:  y = (mask ⊙ x) / (1 − p),   mask ~ Bernoulli(1−p)
Inference: y = x   (no dropout, no scaling needed)
\`\`\`

**What it solves:** Prevents co-adaptation — neurons can't rely on specific other neurons always being present → acts as training an ensemble of 2^n thinned networks. Reduces overfitting.

\`\`\`python
import torch.nn as nn

# Order matters: Linear → BN → Activation → Dropout
block = nn.Sequential(
    nn.Linear(256, 256),
    nn.BatchNorm1d(256),
    nn.ReLU(),
    nn.Dropout(p=0.3),   # applied after activation
)
\`\`\`

**Note:** Do NOT use BN and Dropout together in the same block carelessly — BN's variance estimate is corrupted by Dropout's masking. Place Dropout after BN or use them in separate stages.`,
      tags: ["regularization", "batch-norm", "dropout", "deep-learning"],
    },
    {
      id: "ml-learning-rate-schedulers",
      title: "Learning rate schedulers and adaptive optimizers",
      difficulty: "hard",
      question:
        "Why is a constant learning rate suboptimal? Describe common learning rate schedules and adaptive optimizers (Adam, AdaGrad, RMSProp). What is the 'warmup + cosine decay' pattern?",
      answer: `**Why schedule the LR?**
- High LR early → fast initial progress but instability near optimum.
- Low LR late → fine-grained convergence.
- A fixed LR is a compromise that is suboptimal throughout training.

**Common schedules:**

| Schedule | Behavior |
|----------|---------|
| **Step decay** | Multiply LR by factor γ every N epochs |
| **Cosine annealing** | Smoothly decays LR following a cosine curve |
| **Exponential decay** | LR × γᵉᵖᵒᶜʰ |
| **ReduceLROnPlateau** | Reduce when val metric stops improving (adaptive to training dynamics) |
| **Warmup + cosine** | Linear warmup from 0 → peak LR, then cosine decay |

**Adaptive optimizers** maintain per-parameter learning rates:

| Optimizer | Key idea | Issue |
|-----------|---------|-------|
| **AdaGrad** | Scale LR by 1/√(sum of past gradients²) | LR shrinks to 0 over time |
| **RMSProp** | Use exponential moving average of gradient² | Fixes AdaGrad's decay |
| **Adam** | RMSProp + momentum (first + second moment estimates) | May not generalize as well as SGD+momentum on some tasks |
| **AdamW** | Adam with decoupled weight decay | Default for most deep learning in 2026 |

**Warmup + cosine decay** (dominant pattern in transformers):
\`\`\`python
import torch
from torch.optim import AdamW
from torch.optim.lr_scheduler import CosineAnnealingLR, LinearLR, SequentialLR

optimizer = AdamW(model.parameters(), lr=1e-3, weight_decay=0.01)

warmup = LinearLR(optimizer, start_factor=0.01, end_factor=1.0, total_iters=500)
cosine = CosineAnnealingLR(optimizer, T_max=9500, eta_min=1e-6)

scheduler = SequentialLR(optimizer, schedulers=[warmup, cosine], milestones=[500])
\`\`\`

**Intuition for warmup:** At initialization, weights are random — large gradients are noisy. A low LR avoids large destructive updates in the first steps before the gradient estimates stabilize.`,
      tags: ["optimization", "learning-rate", "deep-learning"],
    },
    {
      id: "ml-sklearn-pipeline-full",
      title: "End-to-end scikit-learn pipeline with cross-validation",
      difficulty: "hard",
      question:
        "Build a production-grade scikit-learn pipeline that handles heterogeneous features, prevents data leakage, tunes hyperparameters, and reports final test-set metrics.",
      answer: `\`\`\`python
import numpy as np
import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import (
    StratifiedKFold, cross_val_score, train_test_split, RandomizedSearchCV
)
from sklearn.metrics import classification_report, roc_auc_score
from scipy.stats import randint, uniform

# ── 1. Define feature groups ──────────────────────────────────────────────────
num_features = ["age", "income", "tenure"]
cat_features = ["country", "plan_type"]

# ── 2. Sub-pipelines (fit on train only — guaranteed by Pipeline API) ─────────
num_pipe = Pipeline([
    ("imputer", SimpleImputer(strategy="median")),
    ("scaler", StandardScaler()),
])
cat_pipe = Pipeline([
    ("imputer", SimpleImputer(strategy="most_frequent")),
    ("ohe", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
])

preprocessor = ColumnTransformer([
    ("num", num_pipe, num_features),
    ("cat", cat_pipe, cat_features),
], remainder="drop")

# ── 3. Full pipeline ──────────────────────────────────────────────────────────
full_pipe = Pipeline([
    ("prep", preprocessor),
    ("clf", GradientBoostingClassifier(random_state=42)),
])

# ── 4. Hyperparameter search ──────────────────────────────────────────────────
param_dist = {
    "clf__n_estimators":   randint(100, 500),
    "clf__learning_rate":  uniform(0.01, 0.3),
    "clf__max_depth":      randint(2, 7),
    "clf__subsample":      uniform(0.6, 0.4),
}

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
search = RandomizedSearchCV(
    full_pipe, param_dist, n_iter=50, cv=cv,
    scoring="roc_auc", n_jobs=-1, random_state=42, verbose=1,
)

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.15, stratify=y, random_state=42
)
search.fit(X_train, y_train)

# ── 5. Evaluate on held-out test set (touch once!) ───────────────────────────
best = search.best_estimator_
y_prob = best.predict_proba(X_test)[:, 1]
y_pred = best.predict(X_test)

print(f"Best params: {search.best_params_}")
print(f"CV ROC-AUC:  {search.best_score_:.4f}")
print(f"Test ROC-AUC:{roc_auc_score(y_test, y_prob):.4f}")
print(classification_report(y_test, y_pred))
\`\`\`

**Key safeguards in this pattern:**
1. \`ColumnTransformer\` inside \`Pipeline\` → imputers/scalers/encoders only see train data in each CV fold.
2. \`RandomizedSearchCV\` wraps the full pipeline → hyperparameter tuning never leaks test data.
3. Test set is touched exactly once at the end.
4. \`stratify=y\` preserves class ratios in the split.`,
      tags: ["pipelines", "scikit-learn", "cross-validation", "production"],
    },
    {
      id: "ml-dimensionality-reduction-tsne-umap",
      title: "t-SNE and UMAP for non-linear dimensionality reduction",
      difficulty: "hard",
      question:
        "How do t-SNE and UMAP work conceptually? How do they differ from PCA, and what are the caveats when interpreting their visualizations?",
      answer: `**PCA** is a linear method — it finds directions of maximum variance and projects data onto them. It preserves global structure but misses non-linear manifolds.

**t-SNE (t-distributed Stochastic Neighbor Embedding):**
1. Compute pairwise similarities in high-d space using Gaussian kernel: p_{ij} ∝ exp(−‖xᵢ−xⱼ‖²/2σ²).
2. Initialize points randomly in 2D.
3. Compute pairwise similarities in 2D using t-distribution (heavier tails): q_{ij} ∝ (1 + ‖yᵢ−yⱼ‖²)⁻¹.
4. Minimize KL divergence KL(P‖Q) via gradient descent.

The **t-distribution** in the low-d space prevents crowding — moderate distances in high-d are mapped to large distances in 2D.

**UMAP (Uniform Manifold Approximation and Projection):**
- Based on Riemannian geometry and algebraic topology (fuzzy simplicial sets).
- Constructs a weighted k-nearest-neighbor graph in high-d, then optimizes a low-d layout that preserves local + (more of the) global structure.
- Significantly faster than t-SNE (especially for N > 10k).
- Better global structure preservation.

\`\`\`python
from sklearn.preprocessing import StandardScaler
from umap import UMAP
import matplotlib.pyplot as plt

X_scaled = StandardScaler().fit_transform(X)

reducer = UMAP(n_components=2, n_neighbors=15, min_dist=0.1, random_state=42)
embedding = reducer.fit_transform(X_scaled)

plt.scatter(embedding[:, 0], embedding[:, 1], c=y, cmap="tab10", s=5)
plt.colorbar()
plt.title("UMAP projection")
\`\`\`

**Caveats — common misinterpretations:**

| Claim | Truth |
|-------|-------|
| "Cluster sizes reflect class frequencies" | False — both t-SNE and UMAP do not preserve density. |
| "Distance between clusters is meaningful" | False for t-SNE; partially true for UMAP. |
| "The shape is deterministic" | False — results depend on random init, hyperparameters (perplexity, n_neighbors). |
| "Use these for features in a model" | Rarely advisable — UMAP can be used as a preprocessing step but t-SNE is transductive only. |

**Rule of thumb:** Use these for **visualization and exploration only**, not as features for downstream models unless carefully validated.`,
      tags: ["dimensionality-reduction", "tsne", "umap", "visualization"],
    },
    {
      id: "ml-rmse-mae-r2",
      title: "Regression evaluation metrics — RMSE, MAE, MAPE, and R²",
      difficulty: "hard",
      question:
        "Compare RMSE, MAE, MAPE, and R² as regression evaluation metrics. When is each appropriate, and what are their failure modes?",
      answer: `| Metric | Formula | Units | Sensitive to outliers? |
|--------|---------|-------|----------------------|
| **MAE** | (1/n) Σ \|yᵢ − ŷᵢ\| | Same as y | No (linear in error) |
| **RMSE** | √[(1/n) Σ (yᵢ − ŷᵢ)²] | Same as y | Yes (squares large errors) |
| **MAPE** | (100/n) Σ \|yᵢ − ŷᵢ\| / \|yᵢ\| | % | Undefined for yᵢ = 0; biased for small y |
| **R²** | 1 − SS_res / SS_tot | Dimensionless [−∞, 1] | Sensitive to scale of y |

**When to use which:**

- **MAE:** When outliers are genuine and should not dominate the metric. Interpretable in original units.
- **RMSE:** When large errors are especially bad (e.g., financial forecasting). RMSE ≥ MAE always; the gap indicates outlier prevalence.
- **MAPE:** Business reporting where percentage error is intuitive. Fails with near-zero targets.
- **R²:** Comparing models on the same dataset. R² = 0.9 means the model explains 90% of variance. Can be negative (model worse than a constant mean predictor). Does NOT generalize across datasets — a high R² on a noisy dataset doesn't mean the model is good.

\`\`\`python
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import numpy as np

mae  = mean_absolute_error(y_test, y_pred)
rmse = np.sqrt(mean_squared_error(y_test, y_pred))
r2   = r2_score(y_test, y_pred)

# MAPE (guard against zero division)
mask = y_test != 0
mape = np.mean(np.abs((y_test[mask] - y_pred[mask]) / y_test[mask])) * 100

print(f"MAE={mae:.2f}  RMSE={rmse:.2f}  MAPE={mape:.1f}%  R²={r2:.3f}")
\`\`\`

**Huber loss** is a hybrid: behaves like MSE for small errors and MAE for large ones — robust to outliers while remaining differentiable everywhere. Controlled by threshold δ.`,
      tags: ["evaluation", "metrics", "regression"],
    },
  ],
};
