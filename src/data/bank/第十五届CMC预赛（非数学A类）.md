## 2023 第十五届CMC预赛 非数学A类 填空1
类型: 填空
知识点: 极限, 洛必达法则
难度: 2
分值: 5
题目: $\displaystyle\lim_{x\to3}\frac{\sqrt{x^3+9}-6}{2-\sqrt{x^3-23}}=$ ＿＿＿
答案: -1/3
备选: -0.333333333333
解析:
使用洛必达法则，得

$$\lim_{x\to3}\frac{\sqrt{x^3+9}-6}{2-\sqrt{x^3-23}}=\lim_{x\to3}\frac{\frac{3x^2}{2\sqrt{x^2+9}}}{-\frac{3x^2}{2\sqrt{x^3-23}}}=-\lim_{x\to3}\frac{\sqrt{x^3-23}}{\sqrt{x^3+9}}=-\frac{1}{3}.$$

## 2023 第十五届CMC预赛 非数学A类 填空2
类型: 解答
知识点: 多元复合函数, 二阶偏导数
难度: 3
分值: 14
题目: 设 $z=f(x^2-y^2,xy)$，且 $f(u,v)$ 有连续的二阶偏导数，则 $\dfrac{\partial^2z}{\partial x\partial y}=$
答案: 见结论：$\displaystyle z_x=f_2-4xyf_{11}+2(x^2-y^2)f_{12}+xyf_{22}$（$f_{ij}=\dfrac{\partial^2f}{\xi^i\partial\eta^j}$）。
解析:
$$z_x=2xf_1+yf_2,$$

$$z_{xy}=2x(f_{11}(-2y)+xf_{12})+f_2+y(f_{21}(-2y)+xf_{22})$$

$$=f_2-4xyf_{11}+2(x^2-y^2)f_{12}+xyf_{22}.$$

## 2023 第十五届CMC预赛 非数学A类 填空3
类型: 填空
知识点: 高阶导数, 部分分式
难度: 3
分值: 5
题目: 设 $f(x)=\dfrac{1}{x^2-3x+2}$，则 $f^{(n)}(0)=$ ＿＿＿
答案: n!*(1-1/2^(n+1))
解析:
$$f(x)=-\frac{1}{x-1}+\frac{1}{x-2},$$

$$f^{(n)}(x)=(-1)^{n+1}\cdot n!\left(\frac{1}{(x-1)^{n+1}}-\frac{1}{(x-2)^{n+1}}\right),$$

$$f^{(n)}(0)=n!\left(1-\frac{1}{2^{n+1}}\right).$$

## 2023 第十五届CMC预赛 非数学A类 填空4
类型: 填空
知识点: 幂级数, 收敛域
难度: 3
分值: 5
题目: 幂级数 $\displaystyle\sum_{n=1}^{\infty}\frac{(-1)^{n-1}x^{2n}}{n(2n-1)}$ 的收敛域为＿＿＿
答案: [-1,1]
解析:
因为 $\displaystyle\lim_{n\to\infty}\sqrt[n]{\frac{1}{n(2n-1)}}=1$，所以收敛半径为 1。

当 $x=\pm1$ 时，$\displaystyle\sum_{n=1}^{\infty}\frac{(-1)^{n-1}}{n(2n-1)}$ 绝对收敛，故收敛域为 $[-1,1]$。

## 2023 第十五届CMC预赛 非数学A类 填空5
类型: 填空
知识点: 第一型曲面积分, 投影
难度: 3
分值: 5
题目: 设曲面 $\Sigma$ 是平面 $y+z=5$ 被柱面 $x^2+y^2=25$ 所截得的部分，则 $\displaystyle\iint_\Sigma(x+y+z)dS=$ ＿＿＿
答案: 125*sqrt(2)*pi
解析:
$\Sigma$ 的方程为 $z=5-y$，故

$$dS=\sqrt{2}dxdy.$$

$\Sigma$ 在 $xOy$ 平面的投影 $D_{xy}:x^2+y^2\leq25$。故

$$I=\sqrt{2}\iint_{D_{xy}}(x+5)dxdy=5\sqrt{2}\iint_{D_{xy}}dxdy=125\sqrt{2}\pi.$$

## 2023 第十五届CMC预赛 非数学A类 解答二
类型: 解答
知识点: 一阶微分方程, 齐次方程, 变量代换
难度: 5
分值: 14
题目: （本题 14 分）解方程 $\left(x^2+y^2+3\right)\dfrac{dy}{dx}=2x\left(2y-\dfrac{x^2}{y}\right)$。
答案: $(y^2-2x^2-3)^3=C(y^2-x^2-1)^2$
解析:
原方程变形为 $\dfrac{y\,dy}{x\,dx}=\dfrac{2(2y^2-x^2)}{x^2+y^2+3}$。

令 $u=x^2,v=y^2$，则原方程化为 $\dfrac{dv}{du}=\dfrac{2(2v-u)}{u+v+3}$.（5分）

解方程 $2v-u=0,u+v+3=0$，得到 $u=-2,v=-1$，再令 $U=u+2,V=v+1$，上述方程化为

$$\frac{dV}{dU}=\frac{2(2V-U)}{U+V}.（8分）$$

作变量替换 $W=\dfrac{V}{U}$ 得到 $U\dfrac{dW}{dU}=-\dfrac{W^2-3W+2}{W+1}$.（11分）

这是分离变量方程，解之得 $U(W-2)^3=C(W-1)^2$，回代得

$$\left(y^2-2x^2-3\right)^3=C\left(y^2-x^2-1\right)^2.$$（14分）

## 2023 第十五届CMC预赛 非数学A类 解答三
类型: 解答
知识点: 旋转体体积, 圆锥面, 切线, 三重积分
难度: 5
分值: 14
题目: （本题 14 分）设 $\Sigma_1$ 是以 $(0,4,0)$ 为顶点且与曲面 $\Sigma_2:\dfrac{x^2}{3}+\dfrac{y^2}{4}+\dfrac{z^2}{3}=1$（$y>0$）相切的圆锥面，求曲面 $\Sigma_1$ 与 $\Sigma_2$ 所围成的空间区域的体积。
答案: $\pi$
解析:
设 $L$ 是 $xOy$ 平面上过点 $(0,4)$ 且与 $\dfrac{x^2}{3}+\dfrac{y^2}{4}=1$ 相切于点 $(x_0,y_0)$ 的直线，则 $\dfrac{x_0^2}{3}+\dfrac{y_0^2}{4}=1$ 且切线斜率 $\dfrac{y_0-4}{x_0}=-\dfrac{4x_0}{3y_0}$，解得 $x_0=\pm\dfrac{3}{2},y_0=1$.（5分）

显然，$\Sigma_1$ 与 $\Sigma_2$ 分别是切线 $L$ 和曲线 $\dfrac{x^2}{3}+\dfrac{y^2}{4}=1$ 绕 $y$ 轴旋转而成的曲面，它们的交线位于平面 $y_0=1$ 上.（8分）

记该平面与 $\Sigma_1,\Sigma_2$ 围成的空间区域分别记为 $\Omega_1$ 和 $\Omega_2$。

由于 $\Sigma_1$ 是底面圆的半径为 $\dfrac{3}{2}$，高为 3 的圆锥体，所以其体积 $V_1=\dfrac{1}{3}\cdot\pi\left(\dfrac{3}{2}\right)^2\cdot3=\dfrac{9\pi}{4}$。又 $\Omega_2$ 的体积为

$$V_2=\iiint_{\Omega_2}\,dV=\int_1^2dy\iint_{x^2+z^2\leq3\left(1-\frac{y^2}{4}\right)}dxdz=\pi\int_1^23\left(1-\frac{y^2}{4}\right)dy=\frac{5\pi}{4}.$$

因此，曲面 $\Sigma_1$ 与 $\Sigma_2$ 所围成的空间区域的体积为 $\dfrac{9\pi}{4}-\dfrac{5\pi}{4}=\pi$.（14分）

## 2023 第十五届CMC预赛 非数学A类 解答四
类型: 解答
知识点: 反常积分, 极限, 夹逼准则, 分部积分
难度: 4
分值: 14
题目: （本题 14 分）设 $I_n=n\displaystyle\int_1^a\frac{dx}{1+x^n}$，其中 $a>1$。求极限 $\displaystyle\lim_{n\to\infty}I_n$。
答案: $\ln 2$
解析:
记 $b=\dfrac{1}{a}$，则 $0<b<1$。作变量替换 $x=\dfrac{1}{t}$，得到

$$I_n=\int_b^1\frac{nt^{n-1}}{t(1+t^n)}dt=\int_b^1\frac{d(\ln(1+t^n))}{t}.$$

分部积分得

$$I_n=\ln 2-\frac{\ln(1+b^n)}{b}+\int_b^1\frac{\ln(1+t^n)}{t^2}dt.$$（8分）

当 $t\in[b,1]$ 时，$\dfrac{\ln(1+t^n)}{t^2}\leqslant t^{n-2}$，

$$0\leqslant\int_b^1\frac{\ln(1+t^n)}{t^2}dt\leqslant\int_b^1t^{n-2}dt=\frac{1-b^{n-1}}{n-1}.$$

显然，$\displaystyle\lim_{n\to\infty}\frac{1-b^{n-1}}{n-1}=0$。由夹逼准则，$\displaystyle\lim_{n\to\infty}\int_b^1\frac{\ln(1+t^n)}{t^2}dt=0$。

又 $\displaystyle\lim_{n\to\infty}\frac{\ln(1+b^n)}{b}=0$，$\displaystyle\lim_{n\to\infty}I_n=\ln 2$.（14分）

## 2023 第十五届CMC预赛 非数学A类 解答五
类型: 解答
知识点: 分部积分, Cauchy积分不等式, 等式条件
难度: 5
分值: 14
题目: （本题 14 分）设 $f(x)$ 在 $[0,1]$ 上有连续的导数且 $f(0)=0$。求证：$\displaystyle\int_0^1f^2(x)dx\leq4\int_0^1(1-x)^2|f'(x)|^2dx$，并求使上式成为等式的 $f(x)$。
答案: 等式成立当且仅当 $f(x)=0$
解析:
由分部积分法

$$\int_0^1f^2(x)dx=(x-1)f^2(x)\bigg|_0^1-\int_0^1(x-1)2f(x)f'(x)dx=2\int_0^1(1-x)f'(x)\cdot f(x)dx.$$（4分）

由 Cauchy 积分不等式，有

$$\int_0^1(1-x)f'(x)\cdot f(x)dx\leq\left(\int_0^1(1-x)^2(f'(x))^2dx\right)^{\frac{1}{2}}\left(\int_0^1f^2(x)dx\right)^{\frac{1}{2}}.$$

于是

$$\int_0^1f^2(x)dx\leq4\int_0^1(1-x)^2|f'(x)|^2dx.$$（10分）

等式成立时应有常数 $c$ 使得 $(1-x)f'(x)=cf(x)$。因此当 $x\in(0,1)$ 时，有

$$\left((1-x)^cf(x)\right)'=(1-x)^{c-1}\left((1-x)f'(x)-cf(x)\right)=0.$$

因而存在常数 $d$ 使得 $f(x)=d(1-x)^{-c}$（$0<x<1$）。

当 $x\to0$ 时，$f(x)\to0$，故 $d=0$。于是 $f=0$。所以使得题中不等式成为等式的函数是 $f(x)=0$.（14分）

## 2023 第十五届CMC预赛 非数学A类 解答六
类型: 解答
知识点: 递推数列, 级数收敛, 裂项求和
难度: 5
分值: 14
题目: （本题 14 分）设数列 $\{x_n\}$ 满足 $x_0=\dfrac{1}{3}$，$x_{n+1}=\dfrac{x_n^2}{1-x_n+x_n^2}$，$n\geq0$。证明：无穷级数 $\displaystyle\sum_{n=0}^{\infty}x_n$ 收敛并求其和。
答案: 收敛，和为 $\dfrac{1}{2}$
解析:
方法 1. 根据数学归纳法可知 $x_n>0$。

此外，$x_{n+1}-x_n=-\dfrac{x_n(1-x_n)^2}{1-x_n+x_n^2}<0$。

故 $x_n$ 单调递减，$x_n\leqslant\dfrac{1}{3}$。

于是，$x_{n+1}=x_n\cdot\dfrac{x_n}{1-x_n+x_n^2}\leqslant\dfrac{4}{9}x_n$，

$x_n$ 收敛于 0。（6分）

令 $f(x)=\dfrac{x}{1+x},x>0$。不难验证 $f(x)$ 严格单调递增且其反函数为 $f^{-1}(x)=\dfrac{x}{1-x}$。

注意到 $x_{n+1}=f(f^{-1}(x_n)-x_n)$，故

$$f^{-1}(x_{n+1})=f^{-1}(x_n)-x_n,\quad x_n=f^{-1}(x_n)-f^{-1}(x_{n+1}).$$

$$\sum_{i=0}^{n}x_i=f^{-1}(x_0)-f^{-1}(x_{n+1}).$$

$$\sum_{i=0}^{\infty}x_i=f^{-1}(x_0)-f^{-1}(0)=\frac{1}{2}.$$（14分）

方法 2. 证明 $x_n$ 收敛于 0 同方法 1。

注意到

$$x_n=\frac{x_n}{1-x_n}-\frac{x_{n+1}}{1-x_{n+1}}.$$

$$\sum_{i=0}^{n}x_i=\frac{x_0}{1-x_0}-\frac{x_{n+1}}{1-x_{n+1}}.$$

$$\sum_{i=0}^{\infty}x_i=\frac{x_0}{1-x_0}=\frac{1}{2}.$$（14分）
