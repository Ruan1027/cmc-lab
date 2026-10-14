## 2023 第十四届CMC第二次补赛 非数学类 填空1
类型: 填空
知识点: 数列极限, 定积分定义
难度: 2
分值: 5
题目: 极限 $\displaystyle\lim_{n\to\infty}\frac{1}{n^3}\left[1^2+3^2+\cdots+(2n-1)^2\right]=$ ＿＿＿
答案: 4/3
备选: 1.333333333333
解析:
利用定积分的定义，得

$$\lim_{n\to\infty}\frac{1}{n^3}\left[1^2+3^2+\cdots+(2n-1)^2\right]=4\lim_{n\to\infty}\frac{1}{n}\sum_{k=1}^n\left(\frac{k}{n}-\frac{1}{2n}\right)^2=4\int_0^1x^2dx=\frac{4}{3}.$$

## 2023 第十四届CMC第二次补赛 非数学类 填空2
类型: 填空
知识点: 可微与连续, 导数定义, 切线方程
难度: 3
分值: 5
题目: 设函数 $f(x)$ 在 $x=1$ 的某一邻域内可微，且满足 $f(1+x)-3f(1-x)=4+2x+o(x)$，其中 $o(x)$ 是当 $x\to0$ 时 $x$ 的高阶无穷小，则曲线 $y=f(x)$ 在点 $(1,f(1))$ 处的切线方程为＿＿＿
答案: x-2y-5=0
解析:
由于 $f(x)$ 在 $x=1$ 处可微，因而连续，故对所给等式求极限 $x\to0$，可得 $-2f(1)=4$，所以 $f(1)=-2$。仍由所给等式，得

$$\frac{f(1+x)-f(1)}{x}+3\cdot\frac{f(1-x)-f(1)}{-x}=2+\frac{o(x)}{x},$$

两边取极限 $x\to0$，并根据导数的定义，得 $4f'(1)=2$，所以 $f'(1)=\dfrac{1}{2}$。

因此，曲线 $y=f(x)$ 在点 $(1,f(1))$ 处的切线方程为

$$y-f(1)=f'(1)(x-1),\quad\text{即}\quad x-2y-5=0.$$

## 2023 第十四届CMC第二次补赛 非数学类 填空3
类型: 填空
知识点: 二阶常系数线性微分方程, 初值问题
难度: 3
分值: 5
题目: 设 $y=y(x)$ 是初值问题 $\begin{cases}y''-2y'-3y=1\\ y(0)=0,\ y'(0)=1\end{cases}$ 的解，则 $y(x)=$ ＿＿＿
答案: (1/3)*(e^(3x)-1)
备选: \frac{1}{3}(e^{3x}-1)
解析:
对于齐次微分方程 $y''-2y'-3y=0$，其特征方程 $\lambda^2-2\lambda-3=0$ 的根为 $\lambda_1=3$，$\lambda_2=-1$，所以 $y''-2y'-3y=0$ 的通解为 $y=C_1e^{3x}+C_2e^{-x}$。

经观察，非齐次微分方程 $y''-2y'-3y=1$ 的一个特解为 $y_0=-\dfrac{1}{3}$。所以，方程的通解为 $y(x)=C_1e^{3x}+C_2e^{-x}-\dfrac{1}{3}$。

又由 $y(0)=0$，$y'(0)=1$ 解得，$C_1=\dfrac{1}{3}$，$C_2=0$，因此 $y(x)=\dfrac{1}{3}\left(e^{3x}-1\right)$。

## 2023 第十四届CMC第二次补赛 非数学类 填空4
类型: 填空
知识点: 复合函数求导, 链式法则, 偏导数
难度: 5
分值: 5
题目: 设可微函数 $z=z(x,y)$ 满足 $x^2\dfrac{\partial z}{\partial x}+y^2\dfrac{\partial z}{\partial y}=2z^2$，又设 $u=x$，$v=\dfrac{1}{y}-\dfrac{1}{x}$，$w=\dfrac{1}{z}-\dfrac{1}{u}$，则对函数 $w=w(u,v)$，偏导数 $\dfrac{\partial w}{\partial u}\bigg|_{v=1}=$ ＿＿＿
答案: -1/4
备选: -0.25
解析:
由 $u=x$，$v=\dfrac{1}{y}-\dfrac{1}{x}$ 解得 $x=u$，$y=\dfrac{u}{uv+1}$，且 $w=\dfrac{1}{z}-\dfrac{1}{u}$，所以

$$\frac{\partial w}{\partial u}=\frac{\partial}{\partial u}\left(\frac{1}{z}-\frac{1}{u}\right)=-\frac{1}{z^2}\cdot\frac{\partial z}{\partial u}+\frac{1}{u^2}=-\frac{1}{z^2}\left(\frac{\partial z}{\partial x}\frac{\partial x}{\partial u}+\frac{\partial z}{\partial y}\frac{\partial y}{\partial u}\right)+\frac{1}{u^2}$$

$$=-\frac{1}{z^2}\left(\frac{\partial z}{\partial x}+\frac{\partial z}{\partial y}\cdot\frac{uv+1-uv}{(uv+1)^2}\right)+\frac{1}{u^2}=-\frac{1}{z^2}\left(\frac{\partial z}{\partial x}+\frac{\partial z}{\partial y}\cdot\frac{1}{(uv+1)^2}\right)+\frac{1}{u^2}$$

$$=-\frac{1}{z^2}\left(\frac{\partial z}{\partial x}+\frac{\partial z}{\partial y}\cdot\frac{y^2}{u^2}\right)+\frac{1}{u^2}=-\frac{1}{z^2u^2}\left(x^2\frac{\partial z}{\partial x}+y^2\frac{\partial z}{\partial y}\right)+\frac{1}{u^2}=-\frac{1}{u^2}.$$

因此 $\dfrac{\partial w}{\partial u}\bigg|_{v=1}=-\dfrac{1}{4}$。

## 2023 第十四届CMC第二次补赛 非数学类 填空5
类型: 解答
知识点: 第一型曲面积分, 曲面重心, 对称性
难度: 4
分值: 14
题目: 设 $a>0$，则均匀曲面 $x^2+y^2+z^2=a^2$（$x\geq0,y\geq0,z\geq0$）的重心坐标为
答案: 见结论：曲面重心坐标为 $\left(\dfrac{a}{2},\,\dfrac{a}{2},\,\dfrac{a}{2}\right)$。
解析:
记所给曲面为 $\Sigma$，并设 $\Sigma$ 的面密度为常数 $\mu$，$\Sigma$ 的重心坐标为 $(\bar{x},\bar{y},\bar{z})$。

由于 $\Sigma$ 的质量为 $M=\dfrac{1}{8}\cdot4\pi a^2\mu=\dfrac{\pi a^2\mu}{2}$，所以

$$\bar{z}=\frac{1}{M}\iint_\Sigma z\mu dS=\frac{2}{\pi a^2}\iint_\Sigma z\,dS.$$

设 $\Sigma$ 的外法向量与 $z$ 轴正向的夹角为 $\gamma$，则 $\cos\gamma=\dfrac{z}{a}$，所以

$$\bar{z}=\frac{2}{\pi a^2}\iint_\Sigma z\,dS=\frac{2}{\pi a^2}\iint_\Sigma\cos\gamma\,dS=\frac{2}{\pi a^2}\iint_\Sigma dxdy=\frac{2}{\pi a^2}\cdot\frac{1}{4}\pi a^2=\frac{a}{2}.$$

根据对称性，$\bar{x}=\bar{y}=\dfrac{a}{2}$，因此此曲面的重心坐标为 $\left(\dfrac{a}{2},\dfrac{a}{2},\dfrac{a}{2}\right)$。

## 2023 第十四届CMC第二次补赛 非数学类 解答二
类型: 解答
知识点: 变限积分求导, Leibniz公式, 高阶导数
难度: 5
分值: 14
题目: （本题满分 14 分）设函数 $f(x)=e^{-x}\displaystyle\int_0^x\frac{t^{2023}}{1+t^4}dt$，正整数 $n\leq2023$，求导数 $f^{(n)}(0)$。
答案: $0$
解析:
令 $F(x)=\displaystyle\int_0^x\frac{t^{2023}}{1+t^4}dt$，则 $F'(x)=\dfrac{x^{2023}}{1+x^4}$，

$$F''(x)=\frac{2023x^{2022}(1+x^4)-2x^{2024}}{(1+x^4)^2},$$

所以 $F(0)=F'(0)=F''(0)=0$.（5分）

对 $f(x)=e^{-x}F(x)$ 利用 Leibniz 公式，再代入 $x=0$ 得

$$f^{(n)}(0)=e^{-x}\sum_{k=0}^n(-1)^{n-k}C_n^kF^{(k)}(x)\bigg|_{x=0}=\sum_{k=0}^n(-1)^{n-k}C_n^kF^{(k)}(0).$$（4分）

欲求 $F^{(k)}(0)$，对 $(1+x^2)F'(x)=x^{2023}$ 两边求 $k-1$ 阶导数，并利用 Leibniz 公式，得

$$(1+x^2)F^{(k)}(x)+2(k-1)xF^{(k-1)}(x)+(k-1)(k-2)F^{(k-2)}(x)=\left(x^{2023}\right)^{(k-1)},$$

代入 $x=0$，并注意到 $k\leq n\leq2023$，得 $F^{(k)}(0)=-(k-1)(k-2)F^{(k-2)}(0)$。由此递推，得

$$F^{(2k)}(0)=\cdots=(-1)^{k-1}(2k-1)!F''(0)=0,$$

$$F^{(2k+1)}(0)=\cdots=(-1)^{k}(2k)!F'(0)=0,$$

因此，$f^{(n)}(0)=\displaystyle\sum_{k=0}^n(-1)^{n-k}C_n^kF^{(k)}(0)=0.$（5分）

## 2023 第十四届CMC第二次补赛 非数学类 解答三
类型: 解答
知识点: 函数极限, 等比数列分解, 无穷小
难度: 4
分值: 14
题目: （本题满分 14 分）设函数 $f(x)$ 在区间 $(0,1)$ 内有定义，$\displaystyle\lim_{x\to0^+}f(x)=0$，且 $\displaystyle\lim_{x\to0^+}\frac{f(x)-f\left(\dfrac{x}{3}\right)}{x}=0$。证明：$\displaystyle\lim_{x\to0^+}\frac{f(x)}{x}=0$。
答案: 见结论：$\displaystyle\lim_{x\to0^+}\frac{f(x)}{x}=0$。由条件递推得 $\lim\frac{f(x)-f(x/3^n)}{x}=0$，取 $n\to\infty$（$f(x/3^n)\to0$）即得。
解析:
根据题设条件得，对任意非负整数 $k$，有 $\displaystyle\lim_{x\to0^+}\frac{f\left(\dfrac{x}{3^k}\right)-f\left(\dfrac{x}{3^{k+1}}\right)}{\dfrac{x}{3^k}}=0.$（4分）

令 $k=0,1,2,\cdots,n-1$，并求和，可得

$$\lim_{x\to0^+}\frac{f(x)-f\left(\dfrac{x}{3^n}\right)}{x}=\lim_{x\to0^+}\sum_{k=0}^{n-1}\frac{f\left(\dfrac{x}{3^k}\right)-f\left(\dfrac{x}{3^{k+1}}\right)}{\dfrac{x}{3^k}}\cdot\frac{1}{3^k}=0.$$（5分）

因此，有 $f(x)-f\left(\dfrac{x}{3^n}\right)=x\alpha(x)$，其中 $\alpha(x)$ 是当 $x\to0^+$ 时的无穷小。

对上式取极限 $n\to\infty$，并利用条件 $\displaystyle\lim_{x\to0^+}f(x)=0$，得 $f(x)=x\alpha(x)$。所以

$$\lim_{x\to0^+}\frac{f(x)}{x}=\lim_{x\to0^+}\alpha(x)=0.$$（5分）

## 2023 第十四届CMC第二次补赛 非数学类 解答四
类型: 解答
知识点: 介值定理, 拉格朗日中值定理, 不等式
难度: 4
分值: 14
题目: （本题满分 14 分）设函数 $f(x)$ 在区间 $[0,1]$ 上连续，在 $(0,1)$ 内可导，且 $f(0)=0$，$f(1)=2$。证明：存在两两互异的点 $\xi_1,\xi_2,\xi_3\in(0,1)$，使得 $f'(\xi_1)f'(\xi_2)\sqrt{1-\xi_3^2}\geq2$。
答案: 见结论：存在两两互异的 $\xi_1,\xi_2,\xi_3\in(0,1)$ 使 $f'(\xi_1)f'(\xi_2)\sqrt{1-\xi_3^2}\ge2$。由 $f'(\xi_1)f'(\xi_2)=\dfrac{2-\xi_3}{1-\xi_3}\ge\dfrac2{\sqrt{1-\xi_3}}$ 即得。
解析:
令 $F(x)=f(x)-2+x$，则 $F(x)$ 在 $[0,1]$ 上连续，且 $F(0)=-2$，$F(1)=1$.

根据连续函数介值定理，存在 $\xi_3\in(0,1)$ 使得 $F(\xi_3)=0$，即 $f(\xi_3)=2-\xi_3$.（5分）

在区间 $[0,\xi_3]$，$[\xi_3,1]$ 上分别利用 Lagrange 中值定理，存在 $\xi_1\in(0,\xi_3)$，$\xi_2\in(\xi_3,1)$，使得

$$\frac{f(\xi_3)-f(0)}{\xi_3-0}=f'(\xi_1),\qquad\text{且}\quad\frac{f(\xi_3)-f(1)}{\xi_3-1}=f'(\xi_2),$$

即 $f'(\xi_1)=\dfrac{2-\xi_3}{\xi_3}$，$f'(\xi_2)=\dfrac{\xi_3}{1-\xi_3}$，（5分）

所以

$$f'(\xi_1)f'(\xi_2)=\frac{2-\xi_3}{1-\xi_3}=1+\frac{1}{1-\xi_3}\geq\frac{2}{\sqrt{1-\xi_3}},$$

因此，存在两两互异的点 $\xi_1,\xi_2,\xi_3\in(0,1)$，使得 $f'(\xi_1)f'(\xi_2)\sqrt{1-\xi_3^2}\geq2$.（4分）

## 2023 第十四届CMC第二次补赛 非数学类 解答五
类型: 解答
知识点: 第二型曲线积分, 参数方程, 奇偶对称性
难度: 4
分值: 14
题目: （本题满分 14 分）设 $f(x)$ 是 $[-1,1]$ 上的连续的偶函数，计算曲线积分 $I=\displaystyle\oint_L\frac{x^2+y^2}{2\sqrt{1-x^2}}dx+f(x)dy$，其中曲线 $L$ 为正向圆周 $x^2+y^2=-2y$。
答案: $4$
解析:
取圆的圆心角 $\theta$ 作参数，则曲线 $L:\ x^2+(y+1)^2=1$ 的参数方程为：$x=\cos\theta$，$y+1=\sin\theta$（$0\leq\theta\leq2\pi$）。因为 $dx=-\sin\theta d\theta$，$dy=\cos\theta d\theta$，所以

$$I=\int_0^{2\pi}\frac{1-\sin\theta}{|\sin\theta|}(-\sin\theta)d\theta+\int_0^{2\pi}f(\cos\theta)\cos\theta d\theta.$$（4分）

其中第一项为

$$I_1=\int_0^{2\pi}-\frac{(1-\sin\theta)}{|\sin\theta|}\sin\theta d\theta=-\int_0^{\pi}(1-\sin\theta)d\theta+\int_{\pi}^{2\pi}(1-\sin\theta)d\theta=4,$$（5分）

第二项为

$$I_2=\int_0^{2\pi}f(\cos\theta)\cos\theta d\theta=\int_0^{\pi}f(\cos\theta)\cos\theta d\theta+\int_{\pi}^{2\pi}f(\cos\theta)\cos\theta d\theta$$

$$=\int_0^{\pi}f(\cos\theta)\cos\theta d\theta+\int_0^{\pi}f(\cos(t+\pi))\cos(t+\pi)dt$$

$$=\int_0^{\pi}f(\cos\theta)\cos\theta d\theta-\int_0^{\pi}f(-\cos t)\cos t\,dt=0,$$

因此，原积分 $I=I_1+I_2=4$.（5分）

## 2023 第十四届CMC第二次补赛 非数学类 解答六
类型: 解答
知识点: 级数收敛, 积分放缩, 泰勒不等式
难度: 4
分值: 14
题目: （本题满分 14 分）设函数 $f(x)=\displaystyle\int_0^x\frac{\ln(1+t)}{1+e^{-t}\sin^2t}dt$（$x>0$），证明级数 $\displaystyle\sum_{n=1}^{\infty}f\left(\frac{1}{n}\right)$ 收敛，且 $\dfrac{1}{3}<\displaystyle\sum_{n=1}^{\infty}f\left(\frac{1}{n}\right)<\dfrac{5}{6}$。
答案: 见结论：级数 $\displaystyle\sum_{n=1}^{\infty}f\left(\frac1n\right)$ 收敛，且 $\dfrac13<\displaystyle\sum_{n=1}^{\infty}f\left(\frac1n\right)<\dfrac56$。用 $\dfrac1{(n+1)^2}\le\ln\left(1+\dfrac1n\right)\le\dfrac1n$ 上下夹逼。
解析:
利用不等式：当 $x\in(0,1]$ 时，$x-\dfrac{x^2}{2}\leq\ln(1+x)\leq x$，$\sin x\leq x$，可得

$$f(x)=\int_0^x\frac{\ln(1+t)}{1+e^{-t}\sin^2t}dt\geq\frac{1}{1+x}\int_0^x\left(t-\frac{t^2}{2}\right)dt=\frac{1}{1+x}\left(\frac{x^2}{2}-\frac{x^3}{6}\right)>\frac{1}{3}\cdot\frac{x^2}{1+x},$$（3分）

且 $f(x)=\displaystyle\int_0^x\frac{\ln(1+t)}{1+e^{-t}\sin^2t}dt\leq\int_0^x t\,dt=\frac{1}{2}x^2$，（3分）

所以

$$\sum_{n=1}^{\infty}f\left(\frac{1}{n}\right)>\frac{1}{3}\sum_{n=1}^{\infty}\frac{\dfrac{1}{n^2}}{1+\dfrac{1}{n}}=\frac{1}{3}\sum_{n=1}^{\infty}\frac{1}{n(n+1)}=\frac{1}{3}\sum_{n=1}^{\infty}\left(\frac{1}{n}-\frac{1}{n+1}\right)=\frac{1}{3},$$（4分）

$$\sum_{n=1}^{\infty}f\left(\frac{1}{n}\right)\leq\frac{1}{2}\sum_{n=1}^{\infty}\frac{1}{n^2}=\frac{1}{2}\cdot\frac{\pi^2}{6}<\frac{5}{6}.$$

综合上述，级数 $\displaystyle\sum_{n=1}^{\infty}f\left(\frac{1}{n}\right)$ 收敛，且 $\dfrac{1}{3}<\displaystyle\sum_{n=1}^{\infty}f\left(\frac{1}{n}\right)<\dfrac{5}{6}$.（4分）
