## 2021 第十三届CMC预赛 非数学类 填空1
类型: 填空
知识点: 极限, 无穷小
难度: 2
分值: 5
题目: 极限 $\displaystyle\lim_{x\to+\infty}\frac{\sqrt{x^2+x+1}-x-\ln(e^x+x)}{x}=$ ＿＿＿
答案: 0
解析:
$$\text{原式}=\lim_{x\to+\infty}\frac{\sqrt{x^2+x+1}-x-\ln(e^x+x)}{x}=-\lim_{x\to+\infty}\sqrt{\frac{1}{1}+\frac{1}{x}+\frac{1}{x^2}}\ln\left(1+\frac{x}{e^x}\right)=0.$$

## 2021 第十三届CMC预赛 非数学类 填空2
类型: 填空
知识点: 隐函数求导, 偏导数
难度: 3
分值: 5
题目: 设 $z=z(x,y)$ 是由方程 $2\sin(x+2y-3z)=x+2y-3z$ 所确定的二元隐函数，则 $\dfrac{\partial z}{\partial x}+\dfrac{\partial z}{\partial y}=$ ＿＿＿
答案: 1
解析:
将方程两边分别关于 $x$ 和 $y$ 求偏导，得

$$\begin{cases}2\cos(x+2y-3z)\left(1-3\dfrac{\partial z}{\partial x}\right)=1-3\dfrac{\partial z}{\partial x},\\[2mm] 2\cos(x+2y-3z)\left(2-3\dfrac{\partial z}{\partial y}\right)=2-3\dfrac{\partial z}{\partial y}.\end{cases}$$

按 $\cos(x+2y-3z)=\dfrac{1}{2}$ 和 $\neq\dfrac{1}{2}$ 两种情形，都可解得 $\dfrac{\partial z}{\partial x}=\dfrac{1}{3}$，$\dfrac{\partial z}{\partial y}=\dfrac{2}{3}$。因此 $\dfrac{\partial z}{\partial x}+\dfrac{\partial z}{\partial y}=1$。

## 2021 第十三届CMC预赛 非数学类 填空3
类型: 填空
知识点: 极限, 变限积分, 洛必达法则, 积分中值定理
难度: 3
分值: 5
题目: 设函数 $f(x)$ 连续，且 $f(0)\neq0$，则 $\displaystyle\lim_{x\to0}\frac{2\displaystyle\int_0^x(x-t)f(t)dt}{x\displaystyle\int_0^x f(u)du}=$ ＿＿＿
答案: 1
解析:
$$\text{原式}=\lim_{x\to0}\frac{2x\displaystyle\int_0^xf(t)dt-2\displaystyle\int_0^xtf(t)dt}{x\displaystyle\int_0^xf(u)du}=\lim_{x\to0}\frac{2\displaystyle\int_0^xf(t)dt+2xf(x)-2xf(x)}{\displaystyle\int_0^xf(u)du+xf(x)}$$

$$=\lim_{x\to0}\frac{2\displaystyle\int_0^xf(t)dt}{\displaystyle\int_0^xf(u)du+xf(x)}=\lim_{x\to0}\frac{2xf(\xi)}{xf(\xi)+xf(x)}=1.$$

其中 $\xi$ 介于 $0,x$ 之间。

## 2021 第十三届CMC预赛 非数学类 填空4
类型: 填空
知识点: 解析几何, 圆柱面, 直线方程
难度: 4
分值: 5
题目: 过三条直线 $L_1:\begin{cases}x=0\\ y-z=2\end{cases}$，$L_2:\begin{cases}x=0\\ x+y-z+2=0\end{cases}$ 与 $L_4:\begin{cases}x=\sqrt{2}\\ y-z=0\end{cases}$ 的圆柱面方程为＿＿＿
答案: 2x^2+y^2+z^2-2yz=4
解析:
三条直线的对称式方程分别为

$$L_1:\frac{x}{0}=\frac{y-1}{1}=\frac{z+1}{1},\qquad L_2:\frac{x}{0}=\frac{y-0}{1}=\frac{z-2}{1},\qquad L_4:\frac{x-\sqrt{2}}{0}=\frac{y-1}{1}=\frac{z-1}{1},$$

所以三条直线平行。

在 $L_1$ 上取点 $P_1(0,1,-1)$，过该点作与三直线都垂直的平面 $y+z=0$，分别交 $L_2$，$L_4$ 于点 $P_2(0,-1,1)$，$P_3(\sqrt{2},0,0)$。易知经过这三点的圆的圆心为 $O(0,0,0)$。这样，所求圆柱面的中心轴线方程为 $\dfrac{x}{0}=\dfrac{y}{1}=\dfrac{z}{1}$。

设圆柱面上任意点的坐标为 $Q(x,y,z)$，因为点 $Q$ 到轴线的距离均为 $\sqrt{2}$，所以有 $\dfrac{|(x,y,z)\times(0,1,1)|}{\sqrt{0^2+1^2+1^2}}=\sqrt{2}$，化简即得所求圆柱面的方程为 $2x^2+y^2+z^2-2yz=4$。

## 2021 第十三届CMC预赛 非数学类 填空5
类型: 填空
知识点: 二重积分, 对称性, 极坐标
难度: 3
分值: 5
题目: 记 $D=\left\{(x,y)\,\middle|\,x^2+y^2\leq\pi\right\}$，则 $\displaystyle\iint_D\left(\sin x^2\cos y^2+x\sqrt{x^2+y^2}\right)dxdy=$ ＿＿＿
答案: pi
备选: \pi
解析:
根据重积分的对称性，得

$$\text{原式}=\iint_D\sin x^2\cos y^2dxdy=\iint_D\sin y^2\cos x^2dxdy$$

$$=\frac{1}{2}\iint_D\left(\sin x^2\cos y^2+\sin y^2\cos x^2\right)dxdy=\frac{1}{2}\iint_D\sin(x^2+y^2)dxdy=\frac{1}{2}\int_0^{2\pi}d\theta\int_0^{\sqrt{\pi}}r\sin r^2dr$$

$$=\frac{\pi}{2}\left(-\cos r^2\right)\Big|_0^{\sqrt{\pi}}=\pi.$$

## 2021 第十三届CMC预赛 非数学类 解答二
类型: 解答
知识点: 数列收敛, 递推数列, 不动点
难度: 4
分值: 14
题目: （14 分）设 $x_1=2021$，$x_n^2-2(x_n+1)x_{n+1}+2021=0$（$n\geq1$），证明数列 $\{x_n\}$ 收敛，并求极限 $\displaystyle\lim_{n\to\infty}x_n$。
答案: $\sqrt{2022}-1$
解析:
记 $a=1011$，$y_n=1+x_n$，函数 $f(x)=\dfrac{x}{2}+\dfrac{a}{x}$（$x>0$），则 $y_1=2a$，且

$$y_{n+1}=f(y_n)\quad(n\geq1).$$

易知，当 $x>\sqrt{2a}$ 时，$x>f(x)>\sqrt{2a}$，所以 $\{y_n\}$ 是单调减少且有下界的数列，因而收敛。由此可知 $\{x_n\}$ 收敛。

令 $\displaystyle\lim_{n\to\infty}y_n=A$，则 $A>0$ 且 $A=f(A)$，解得 $A=\sqrt{2a}$。因此 $\displaystyle\lim_{n\to\infty}x_n=\sqrt{2022}-1$。

## 2021 第十三届CMC预赛 非数学类 解答三
类型: 解答
知识点: 二阶常系数线性微分方程, 通解, 有界性
难度: 4
分值: 14
题目: （14 分）设 $f(x)$ 在 $[0,+\infty)$ 上是有界连续函数，证明：方程 $y''+14y'+13y=f(x)$ 的每一个解在 $[0,+\infty)$ 上都是有界函数。
答案: 见结论：每个解一致有界 $|C_1|+|C_2|+\dfrac{7M}{78}$。特征根为 $-1,-13$，通解含 $\dfrac1{12}e^{-x}\int_0^xf(t)e^t\,dt$ 与 $\dfrac1{12}e^{-13x}\int_0^xf(t)e^{13t}\,dt$ 两项。
解析:
易得对应的齐次方程 $y''+14y'+13y=0$ 的通解为

$$y=C_1e^{-x}+C_2e^{-13x}.$$

又由 $y''+14y'+13y=f(x)$，得 $(y''+y')+13(y'+y)=f(x)$。令 $y_1=y'+y$，则 $y_1'+13y_1=f(x)$，解得 $y_1=e^{-13x}\left(\displaystyle\int_0^xf(t)e^{13t}dt+C_3\right)$。

同理，由 $y''+14y'+13y=f(x)$，得 $(y''+13y')+(y'+13y)=f(x)$。令 $y_2=y'+13y$，则 $y_2'+y_2=f(x)$，解得 $y_2=e^{-x}\left(\displaystyle\int_0^xf(t)e^tdt+C_4\right)$。

取 $C_3=C_4=0$，得

$$\begin{cases}y'+y=e^{-13x}\displaystyle\int_0^xf(t)e^{13t}dt,\\ y'+13y=e^{-x}\displaystyle\int_0^xf(t)e^tdt.\end{cases}$$

由此解得原方程的一个特解为

$$y^*=\frac{1}{12}e^{-x}\int_0^xf(t)e^tdt-\frac{1}{12}e^{-13x}\int_0^xf(t)e^{13t}dt.$$

因此，原方程的通解为

$$y=C_1e^{-x}+C_2e^{-13x}+\frac{1}{12}e^{-x}\int_0^xf(t)e^tdt-\frac{1}{12}e^{-13x}\int_0^xf(t)e^{13t}dt.$$

因为 $f(x)$ 在 $[0,+\infty)$ 上有界，所以存在 $M>0$，使得 $|f(x)|\leq M,0\leq x<+\infty$。注意到当 $x\in[0,+\infty)$ 时，$0<e^{-x}\leq1,0<e^{-13x}\leq1$，所以

$$|y|\leqslant|C_1e^{-x}|+|C_2e^{-13x}|+\frac{1}{12}e^{-x}\left|\int_0^xf(t)e^tdt\right|+\frac{1}{12}e^{-13x}\left|\int_0^xf(t)e^{13t}dt\right|$$

$$\leqslant|C_1|+|C_2|+\frac{M}{12}e^{-x}\int_0^xe^tdt+\frac{M}{12}e^{-13x}\int_0^xe^{13t}dt$$

$$\leqslant|C_1|+|C_2|+\frac{M}{12}\left(1-e^{-x}\right)+\frac{M}{12\times13}\left(1-e^{-13x}\right)$$

$$\leqslant|C_1|+|C_2|+\frac{M}{12}+\frac{M}{12\times13}=|C_1|+|C_2|+\frac{7M}{78}.$$

对于方程的每一个确定的解，常数 $C_1$，$C_2$ 是固定的，所以，原方程的每一个解都是有界的。

## 2021 第十三届CMC预赛 非数学类 解答四
类型: 解答
知识点: 第一型曲面积分, 高斯公式, 齐次函数
难度: 5
分值: 14
题目: （14 分）对于 4 次齐次函数 $f(x,y,z)=a_1x^4+a_2y^4+a_3z^4+3a_4x^2y^2+3a_5y^2z^2+3a_6x^2z^2$，计算曲面积分 $\displaystyle\oint_\Sigma f(x,y,z)dS$，其中 $\Sigma:x^2+y^2+z^2=1$。
答案: $\dfrac{4\pi}{5}\displaystyle\sum_{i=1}^{6}a_i$
解析:
因为 $f(x,y,z)$ 为 4 次齐次函数，所以对 $\forall t\in R$，恒有

$$f(tx,ty,tz)=t^4f(x,y,z).$$

对上式两边关于 $t$ 求导，得

$$xf'_x(tx,ty,tz)+yf'_y(tx,ty,tz)+zf'_z(tx,ty,tz)=4t^3f(x,y,z).$$

取 $t=1$，得

$$xf'_x(x,y,z)+yf'_y(x,y,z)+zf'_z(x,y,z)=4f(x,y,z).$$

设曲面 $\Sigma$ 上点 $(x,y,z)$ 处的外法线方向的方向余弦为 $(\cos\alpha,\cos\beta,\cos\gamma)$，则 $\cos\alpha=x,\cos\beta=y,\cos\gamma=z$，因此

$$\oint_\Sigma f(x,y,z)dS=\frac{1}{4}\oint_\Sigma\left(xf'_x+yf'_y+zf'_z\right)dS$$

$$=\frac{1}{4}\oint_\Sigma\left[\cos\alpha f'_x+\cos\beta f'_y+\cos\gamma f'_z\right]dS$$

$$=\frac{1}{4}\oint_\Sigma f'_x\,dydz+f'_y\,dzdx+f'_z\,dxdy$$

$$=\frac{1}{4}\iiint_{x^2+y^2+z^2\leq1}\left[f''_{xx}+f''_{yy}+f''_{zz}\right]dxdydz\quad(\text{利用高斯公式})$$

$$=\frac{3}{2}\iiint_{x^2+y^2+z^2\leq1}\left[x^2\left(2a_1+a_4+a_6\right)+y^2\left(2a_2+a_4+a_5\right)+z^2\left(2a_3+a_5+a_6\right)\right]dxdydz\quad(\text{利用轮换对称性})$$

$$=\sum_{i=1}^{6}a_i\iiint_{x^2+y^2+z^2\leq1}\left(x^2+y^2+z^2\right)dxdydz=\sum_{i=1}^{6}a_i\int_0^{2\pi}d\theta\int_0^{\pi}d\varphi\int_0^1\rho^4\sin\varphi d\rho$$

$$=\frac{4\pi}{5}\sum_{i=1}^{6}a_i.$$

## 2021 第十三届CMC预赛 非数学类 解答五
类型: 解答
知识点: 泰勒公式, 定积分定义, 夹逼准则
难度: 5
分值: 14
题目: （14 分）设函数 $f(x)$ 在闭区间 $[a,b]$ 上有连续的二阶导数。证明：$\displaystyle\lim_{n\to\infty}n^2\left[\int_a^bf(x)dx-\frac{b-a}{n}\sum_{k=1}^nf\left(a+\frac{2k-1}{2n}(b-a)\right)\right]=\frac{(b-a)^2}{24}\left[f'(b)-f'(a)\right].$
答案: 见结论：$\displaystyle\lim_{n\to\infty}n^2\left[\int_a^bf(x)dx-\frac{b-a}{n}\sum_{k=1}^nf\left(a+\frac{2k-1}{2n}(b-a)\right)\right]=\frac{(b-a)^2}{24}\left[f'(b)-f'(a)\right]$。用中点公式余项夹逼。
解析:
记 $x_k=a+\dfrac{k(b-a)}{n}$，$\xi_k=a+\dfrac{(2k-1)(b-a)}{2n}$，$k=1,2,\cdots,n$。将 $f(x)$ 在 $[x_{k-1},x_k]$ 上展开成泰勒公式，得

$$f(x)=f(\xi_k)+f'(\xi_k)(x-\xi_k)+\frac{f''(\eta_k)}{2}(x-\xi_k)^2,$$

其中 $x\in[x_{k-1},x_k]$，$\eta_k$ 介于 $0$ 和 $x$ 之间。于是

$$B_n=\int_a^bf(x)dx-\frac{b-a}{n}\sum_{k=1}^nf\left(a+\frac{2k-1}{2n}(b-a)\right)=\sum_{k=1}^n\int_{x_{k-1}}^{x_k}\left(f(x)-f(\xi_k)\right)dx$$

$$=\sum_{k=1}^n\int_{x_{k-1}}^{x_k}\left[f'(\xi_k)(x-\xi_k)+\frac{f''(\eta_k)}{2}(x-\xi_k)^2\right]dx=\frac{1}{2}\sum_{k=1}^n\int_{x_{k-1}}^{x_k}f''(\eta_k)(x-\xi_k)^2dx.$$

设 $f''(x)$ 在 $[x_{k-1},x_k]$ 上的最大值和最小值分别为 $M_k$，$m_k$。因为

$$\int_{x_{k-1}}^{x_k}(x-\xi_k)^2dx=\frac{(b-a)^3}{12n^3},$$

所以

$$\frac{(b-a)^2}{24}\sum_{k=1}^nm_k\cdot\frac{b-a}{n}\leq n^2B_n\leq\frac{(b-a)^2}{24}\sum_{k=1}^nM_k\cdot\frac{b-a}{n}.$$

因为 $f''(x)$ 在 $[a,b]$ 上连续，所以 $f''(x)$ 在 $[a,b]$ 上可积。根据定积分 $\displaystyle\int_a^bf''(x)dx$ 的定义，及牛顿-莱布尼兹公式，得

$$\lim_{n\to\infty}\sum_{k=1}^nm_k\frac{b-a}{n}=\lim_{n\to\infty}\sum_{k=1}^nM_k\frac{b-a}{n}=\int_a^bf''(x)dx=f'(b)-f'(a).$$

再根据夹逼准则，得

$$\lim_{n\to\infty}n^2B_n=\frac{(b-a)^2}{24}\left[f'(b)-f'(a)\right].$$

## 2021 第十三届CMC预赛 非数学类 解答六
类型: 解答
知识点: 正项级数, 部分和, 夹逼准则, 收敛证明
难度: 5
分值: 14
题目: （14 分）设 $\{a_n\}$ 与 $\{b_n\}$ 均为正实数列，满足：$a_1=b_1=1$，且 $b_n=a_nb_{n-1}-2$，$n=2,3,\cdots$。又设 $\{b_n\}$ 为有界数列，证明级数 $\displaystyle\sum_{n=1}^{\infty}\frac{1}{a_1a_2\cdots a_n}$ 收敛，并求该级数的和。
答案: 收敛，和为 $\dfrac{3}{2}$
解析:
首先，注意到 $a_1=b_1=1$，且 $a_n=\left(1+\dfrac{2}{b_n}\right)\dfrac{b_n}{b_{n-1}}$，所以当 $n\geq2$ 时，有

$$a_1a_2\cdots a_n=\left(1+\frac{2}{b_2}\right)\left(1+\frac{2}{b_3}\right)\cdots\left(1+\frac{2}{b_n}\right)b_n.$$

由于 $\{b_n\}$ 有界，故存在 $M>0$，使得当 $n\geq1$ 时，恒有 $0<b_n\leq M$。因此

$$0<\frac{b_n}{a_1a_2\cdots a_n}=\left(1+\frac{2}{b_2}\right)^{-1}\left(1+\frac{2}{b_3}\right)^{-1}\cdots\left(1+\frac{2}{b_n}\right)^{-1}\leq\left(1+\frac{2}{M}\right)^{-n+1}\to0,\quad n\to\infty.$$

根据夹逼准则，$\displaystyle\lim_{n\to\infty}\frac{b_n}{a_1a_2\cdots a_n}=0$。

考虑级数 $\displaystyle\sum_{n=1}^{\infty}\frac{1}{a_1a_2\cdots a_n}$ 的部分和 $S_n$，当 $n\geq2$ 时，有

$$S_n=\sum_{k=1}^n\frac{1}{a_1a_2\cdots a_k}=\frac{1}{a_1}+\sum_{k=2}^n\frac{1}{a_1a_2\cdots a_k}\cdot\frac{a_kb_{k-1}-b_k}{2}$$

$$=1+\frac{1}{2}\sum_{k=2}^n\left(\frac{b_{k-1}}{a_1a_2\cdots a_{k-1}}-\frac{b_k}{a_1a_2\cdots a_k}\right)$$

$$=\frac{3}{2}-\frac{b_n}{2a_1a_2\cdots a_n},$$

所以 $\displaystyle\lim_{n\to\infty}S_n=\frac{3}{2}$，这就证明了级数 $\displaystyle\sum_{n=1}^{\infty}\frac{1}{a_1a_2\cdots a_n}$ 收敛，且其和为 $\dfrac{3}{2}$。
