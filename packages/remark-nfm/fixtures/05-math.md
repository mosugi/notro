# Math Equations

## Inline math

Einstein's mass-energy equivalence: $E = mc^2$

The quadratic formula: $x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$

Euler's identity: $e^{i\pi} + 1 = 0$

The derivative definition: $f'(x) = \lim_{h \to 0} \frac{f(x+h) - f(x)}{h}$

## Block math (display equations)

The Gaussian integral:

$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$

Maxwell's equations in differential form:

$$
\nabla \cdot \mathbf{E} = \frac{\rho}{\epsilon_0}
$$

$$
\nabla \times \mathbf{B} = \mu_0 \mathbf{J} + \mu_0 \epsilon_0 \frac{\partial \mathbf{E}}{\partial t}
$$

A matrix multiplication example:

$$
\begin{pmatrix} a & b \\ c & d \end{pmatrix} \begin{pmatrix} e \\ f \end{pmatrix} = \begin{pmatrix} ae + bf \\ ce + df \end{pmatrix}
$$

## Notion-specific: backtick-delimited inline math

Notion sometimes outputs inline math as $`formula`$ format. This should be normalized to $formula$.

The preprocessor converts $`\alpha + \beta = \gamma`$ to standard inline math.

## LaTeX commands without backslash (Notion API quirk)

Notion's API sometimes strips backslashes from LaTeX commands. These should be restored:

$$
frac{1}{2} + frac{1}{3} = frac{5}{6}
$$

$$
\sum_{n=1}^{\infty} frac{1}{n^2} = frac{\pi^2}{6}
$$

## Mixed inline and block math in paragraphs

When we integrate $f(x) = x^2$ from $0$ to $1$, we get:

$$
\int_0^1 x^2 dx = \left[ \frac{x^3}{3} \right]_0^1 = \frac{1}{3}
$$

This demonstrates that the area under the parabola is $\frac{1}{3}$.
