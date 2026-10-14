## 2018 第十届CMC预赛 非数学类 填空1
类型: 填空
知识点: 极限, 夹逼准则
难度: 2
分值: 5
题目: 设 $\alpha\in(0,1)$，则 $\displaystyle\lim_{n\to+\infty}\big((n+1)^\alpha-n^\alpha\big)=$ ＿＿＿
答案: 0
解析:
由于 $\alpha\in(0,1)$，有 $\left(1+\dfrac{1}{n}\right)^\alpha<\left(1+\dfrac{1}{n}\right)$，则

$$(n+1)^\alpha-n^\alpha=n^\alpha\left[\left(1+\frac{1}{n}\right)^\alpha-1\right]<n^\alpha\left[\left(1+\frac{1}{n}\right)-1\right]=\frac{1}{n^{1-\alpha}}.$$

于是 $0<(n+1)^\alpha-n^\alpha<\dfrac{1}{n^{1-\alpha}}$，而 $1-\alpha>0$ 时 $\dfrac{1}{n^{1-\alpha}}\to0$，应用夹逼准则得

$$\lim_{n\to+\infty}\big((n+1)^\alpha-n^\alpha\big)=0.$$

## 2018 第十届CMC预赛 非数学类 填空2
类型: 填空
知识点: 隐函数求导, 参数方程求导, 切线方程
难度: 3
分值: 5
题目: 若曲线 $y=y(x)$ 由 $\begin{cases}x=t+\cos t\\ e^y+ty+\sin t=1\end{cases}$ 确定，则此曲线在 $t=0$ 对应点处的切线方程为＿＿＿
答案: y-0=-(x-1)
备选: y=1-x, y=-x+1, y+x=1
解析:
当 $t=0$ 时，$x=1,\ y=0$。

对 $x=t+\cos t$ 两边关于 $t$ 求导：$\dfrac{dx}{dt}=1-\sin t$，故 $\left.\dfrac{dx}{dt}\right|_{t=0}=1$。

对 $e^y+ty+\sin t=1$ 两边关于 $t$ 求导：$e^y\dfrac{dy}{dt}+y+t\dfrac{dy}{dt}+\cos t=0$，故 $\left.\dfrac{dy}{dt}\right|_{t=0}=-1$，从而 $\left.\dfrac{dy}{dx}\right|_{t=0}=-1$。

所以切线方程为 $y-0=-(x-1)$，即 $y=1-x$。

## 2018 第十届CMC预赛 非数学类 填空3
类型: 填空
知识点: 不定积分, 分部积分, 三角换元
难度: 4
分值: 5
题目: 计算不定积分 $\displaystyle\int\frac{\ln(x+\sqrt{1+x^2})}{(1+x^2)^{3/2}}dx=$ ＿＿＿
答案: x/sqrt(1+x^2)*ln(x+sqrt(1+x^2))-ln(1+x^2)/2+C
备选: \frac{x}{\sqrt{1+x^2}}\ln(x+\sqrt{1+x^2})-\frac{1}{2}\ln(1+x^2)+C
解析:
解法一（三角换元）：令 $x=\tan t$，则

$$\int\frac{\ln(x+\sqrt{1+x^2})}{(1+x^2)^{3/2}}dx=\int\frac{\ln(\tan t+\sec t)}{\sec t}dt=\int\ln(\tan t+\sec t)\,d\sin t$$

$$=\sin t\ln(\tan t+\sec t)-\int\sin t\cdot\frac{\sec^2 t+\tan t\sec t}{\tan t+\sec t}dt=\sin t\ln(\tan t+\sec t)-\int\frac{\sin t}{\cos t}dt$$

$$=\sin t\ln(\tan t+\sec t)+\ln|\cos t|+C=\frac{x}{\sqrt{1+x^2}}\ln(x+\sqrt{1+x^2})-\frac{1}{2}\ln(1+x^2)+C.$$

解法二（分部积分）：

$$\int\frac{\ln(x+\sqrt{1+x^2})}{(1+x^2)^{3/2}}dx=\int\ln(x+\sqrt{1+x^2})\,d\frac{x}{\sqrt{1+x^2}}$$

$$=\frac{x}{\sqrt{1+x^2}}\ln(x+\sqrt{1+x^2})-\int\frac{x}{1+x^2}dx=\frac{x}{\sqrt{1+x^2}}\ln(x+\sqrt{1+x^2})-\frac{1}{2}\ln(1+x^2)+C.$$

## 2018 第十届CMC预赛 非数学类 填空4
类型: 填空
知识点: 极限, 等价无穷小, 泰勒展开
难度: 3
分值: 5
题目: $\displaystyle\lim_{x\to0}\frac{1-\cos x\sqrt{\cos 2x}\sqrt[3]{\cos 3x}}{x^2}=$ ＿＿＿
答案: 3
解析:
拆项得

$$\lim_{x\to0}\frac{1-\cos x\sqrt{\cos 2x}\sqrt[3]{\cos 3x}}{x^2}=\lim_{x\to0}\left[\frac{1-\cos x}{x^2}+\frac{\cos x\left(1-\sqrt{\cos 2x}\sqrt[3]{\cos 3x}\right)}{x^2}\right]$$

$$=\frac{1}{2}+\lim_{x\to0}\frac{1-\sqrt{\cos 2x}\sqrt[3]{\cos 3x}}{x^2}=\frac{1}{2}+\lim_{x\to0}\left[\frac{1-\sqrt{\cos 2x}}{x^2}+\frac{\sqrt{\cos 2x}\left(1-\sqrt[3]{\cos 3x}\right)}{x^2}\right]$$

$$=\frac{1}{2}+\lim_{x\to0}\frac{1-\sqrt{(\cos 2x-1)+1}}{x^2}+\lim_{x\to0}\frac{1-\sqrt[3]{(\cos 3x-1)+1}}{x^2}$$

$$=\frac{1}{2}+\lim_{x\to0}\frac{1-\cos 2x}{2x^2}+\lim_{x\to0}\frac{1-\cos 3x}{3x^2}=\frac{1}{2}+1+\frac{3}{2}=3.$$

## 2018 第十届CMC预赛 非数学类 解答二
类型: 解答
知识点: 曲线积分, 路径无关, 一阶微分方程
难度: 3
分值: 8
题目: （8 分）设函数 $f(t)$ 在 $t\neq0$ 时一阶连续可导，且 $f(1)=0$，求函数 $f(x^2-y^2)$，使得曲线积分 $\displaystyle\int_L\left[y\left(2-f(x^2-y^2)\right)\right]dx+xf(x^2-y^2)dy$ 与路径无关，其中 $L$ 为任一不与直线 $y=\pm x$ 相交的分段光滑闭曲线。
答案: $f(x^2-y^2)=1-\dfrac{1}{x^2-y^2}$
解析:
设 $P(x,y)=y\left(2-f(x^2-y^2)\right)$，$Q(x,y)=xf(x^2-y^2)$。

由题设，积分与路径无关，于是有 $\dfrac{\partial Q}{\partial x}=\dfrac{\partial P}{\partial y}$，由此可知

$$(x^2-y^2)f'(x^2-y^2)+f(x^2-y^2)=1.$$

记 $t=x^2-y^2$，则得微分方程 $tf'(t)+f(t)=1$，即 $(tf(t))'=1$，故 $tf(t)=t+C$。

又 $f(1)=0$，可得 $C=-1$，即 $f(t)=1-\dfrac{1}{t}$，从而

$$f(x^2-y^2)=1-\frac{1}{x^2-y^2}.$$

## 2018 第十届CMC预赛 非数学类 解答三
类型: 解答
知识点: 定积分, 柯西不等式, 积分不等式
难度: 4
分值: 14
题目: （14 分）设 $f(x)$ 在区间 $[0,1]$ 上连续，且 $1\leq f(x)\leq3$。证明：$\displaystyle 1\leq\int_0^1 f(x)dx\int_0^1\frac{1}{f(x)}dx\leq\frac{4}{3}$。
答案: 见结论：$1\le\displaystyle\int_0^1 f(x)dx\int_0^1\dfrac{1}{f(x)}dx\le\dfrac{4}{3}$。左端由柯西不等式；右端由 $1\le f\le3$ 得 $f+\dfrac3f\le4$，再用算术-几何均值不等式。
解析:
左半：由柯西不等式，

$$\int_0^1 f(x)dx\int_0^1\frac{1}{f(x)}dx\geq\left(\int_0^1\sqrt{f(x)}\sqrt{\frac{1}{f(x)}}dx\right)^2=1.$$

右半：由于 $1\leq f(x)\leq3$，有 $(f(x)-1)(f(x)-3)\leq0$，则 $\dfrac{(f(x)-1)(f(x)-3)}{f(x)}\leq0$，即

$$f(x)+\frac{3}{f(x)}\leq4,\qquad \int_0^1\left(f(x)+\frac{3}{f(x)}\right)dx\leq4.$$

再由基本不等式（算术-几何均值），

$$\int_0^1 f(x)dx\int_0^1\frac{3}{f(x)}dx\leq\frac{1}{4}\left(\int_0^1 f(x)dx+\int_0^1\frac{3}{f(x)}dx\right)^2\leq\frac{1}{4}\cdot16=4.$$

故 $\displaystyle 1\leq\int_0^1 f(x)dx\int_0^1\frac{1}{f(x)}dx\leq\frac{4}{3}$。

## 2018 第十届CMC预赛 非数学类 解答四
类型: 解答
知识点: 三重积分, 球坐标, 柱坐标
难度: 4
分值: 12
题目: （12 分）计算三重积分 $\displaystyle\iiint_{(V)}(x^2+y^2)dV$，其中 $(V)$ 是由 $x^2+y^2+(z-2)^2\geq4$，$x^2+y^2+(z-1)^2\leq9$，$z\geq0$ 所围成的空心立体。
答案: $\dfrac{256}{3}\pi$
解析:
将 $(V)$ 分解为大球 $V_1$ 去掉小球 $V_2$ 与下半部分 $V_3$。

(1) $V_1$：$\begin{cases}x=r\sin\varphi\cos\theta,\ y=r\sin\varphi\sin\theta,\ z-1=r\cos\varphi\\ 0\leq r\leq3,\ 0\leq\varphi\leq\pi,\ 0\leq\theta\leq2\pi\end{cases}$

$$\iiint_{(V_1)}(x^2+y^2)dV=\int_0^{2\pi}d\theta\int_0^\pi d\varphi\int_0^3 r^2\sin^2\varphi\cdot r^2\sin\varphi\,dr=\frac{8}{15}\cdot3^5\cdot\pi.$$

(2) $V_2$：$\begin{cases}x=r\sin\varphi\cos\theta,\ y=r\sin\varphi\sin\theta,\ z-2=r\cos\varphi\\ 0\leq r\leq2,\ 0\leq\varphi\leq\pi,\ 0\leq\theta\leq2\pi\end{cases}$

$$\iiint_{(V_2)}(x^2+y^2)dV=\int_0^{2\pi}d\theta\int_0^\pi d\varphi\int_0^2 r^2\sin^2\varphi\cdot r^2\sin\varphi\,dr=\frac{8}{15}\cdot2^5\cdot\pi.$$

(3) $V_3$：$\begin{cases}x=r\cos\theta,\ y=r\sin\theta,\ 1-\sqrt{9-r^2}\leq z\leq0\\ 0\leq r\leq2\sqrt{2},\ 0\leq\theta\leq2\pi\end{cases}$

$$\iiint_{(V_3)}(x^2+y^2)dV=\iint_{r\leq2\sqrt2}r\,drd\theta\int_{1-\sqrt{9-r^2}}^0 r^2dz=\int_0^{2\pi}d\theta\int_0^{2\sqrt2}r^3\left(\sqrt{9-r^2}-1\right)dr=\left(124-\frac{2}{5}\cdot3^5+\frac{2}{5}\right)\pi.$$

综上，

$$\iiint_{(V)}(x^2+y^2)dV=\iiint_{(V_1)}-\iiint_{(V_2)}-\iiint_{(V_3)}=\frac{256}{3}\pi.$$

## 2018 第十届CMC预赛 非数学类 解答五
类型: 解答
知识点: 多元函数微分, 拉格朗日中值定理, 柯西不等式
难度: 3
分值: 14
题目: （14 分）设 $f(x,y)$ 在区域 $D$ 内可微，且 $\sqrt{\left(\dfrac{\partial f}{\partial x}\right)^2+\left(\dfrac{\partial f}{\partial y}\right)^2}\leq M$，$A(x_1,y_1)$，$B(x_2,y_2)$ 是 $D$ 内两点，线段 $AB$ 包含在 $D$ 内。证明：$|f(x_1,y_1)-f(x_2,y_2)|\leq M|AB|$，其中 $|AB|$ 表示线段 $AB$ 的长度。
答案: 见结论：$|f(x_1,y_1)-f(x_2,y_2)|\le M|AB|$。令 $\varphi(t)=f(x_1+t(x_2-x_1),\,y_1+t(y_2-y_1))$，对 $\varphi$ 用拉格朗日中值定理后接 Cauchy 不等式。
解析:
作辅助函数 $\varphi(t)=f\left(x_1+t(x_2-x_1),\ y_1+t(y_2-y_1)\right)$。

显然 $\varphi(t)$ 在 $[0,1]$ 上可导。根据拉格朗日中值定理，存在 $c\in(0,1)$，使得

$$\varphi(1)-\varphi(0)=\varphi'(c)=\frac{\partial f(u,v)}{\partial u}(x_2-x_1)+\frac{\partial f(u,v)}{\partial v}(y_2-y_1).$$

于是

$$|\varphi(1)-\varphi(0)|=|f(x_2,y_2)-f(x_1,y_1)|=\left|\frac{\partial f(u,v)}{\partial u}(x_2-x_1)+\frac{\partial f(u,v)}{\partial v}(y_2-y_1)\right|$$

$$\leq\left[\left(\frac{\partial f(u,v)}{\partial u}\right)^2+\left(\frac{\partial f(u,v)}{\partial v}\right)^2\right]^{1/2}\left[(x_2-x_1)^2+(y_2-y_1)^2\right]^{1/2}\leq M|AB|.$$

## 2018 第十届CMC预赛 非数学类 解答六
类型: 解答
知识点: 定积分, 几何算术均值不等式, 凹函数
难度: 4
分值: 14
题目: （14 分）证明：对于连续函数 $f(x)>0$，有 $\displaystyle\ln\int_0^1 f(x)dx\geq\int_0^1\ln f(x)dx$。
答案: 见结论：$\displaystyle\ln\int_0^1 f(x)dx\ge\int_0^1\ln f(x)dx$。由几何-算术均值不等式取对数后令 $n\to\infty$。
解析:
由于 $f(x)$ 在 $[0,1]$ 上连续，所以 $\displaystyle\int_0^1 f(x)dx=\lim_{n\to+\infty}\frac{1}{n}\sum_{k=1}^n f(x_k)$，其中 $x_k\in\left[\frac{k-1}{n},\frac{k}{n}\right]$。

由几何-算术均值不等式 $\left(f(x_1)f(x_2)\cdots f(x_n)\right)^{1/n}\leq\dfrac{1}{n}\displaystyle\sum_{k=1}^n f(x_k)$，根据 $\ln x$ 的单调性，

$$\frac{1}{n}\sum_{k=1}^n\ln f(x_k)\leq\ln\left(\frac{1}{n}\sum_{k=1}^n f(x_k)\right).$$

根据 $\ln x$ 的连续性，两边取极限得

$$\int_0^1\ln f(x)dx\leq\ln\int_0^1 f(x)dx.$$

## 2018 第十届CMC预赛 非数学类 解答七
类型: 解答
知识点: 正项级数, 比较判别法, Abel变换, 几何算术均值不等式
难度: 5
分值: 14
题目: （14 分）已知 $\{a_k\}$，$\{b_k\}$ 是正项数列，且 $b_{k+1}-b_k\geq\delta>0$，$k=1,2,\cdots$，$\delta$ 为一常数。证明：若级数 $\displaystyle\sum_{k=1}^{+\infty}a_k$ 收敛，则级数 $\displaystyle\sum_{k=1}^{+\infty}\frac{k\sqrt[k]{(a_1a_2\cdots a_k)(b_1b_2\cdots b_k)}}{b_{k+1}b_k}$ 收敛。
答案: 见结论：该级数收敛。记 $S_k=\sum_{i=1}^k a_ib_k$，Abel 分部求和得 $\displaystyle\sum_{k=1}^{\infty}\frac{k\sqrt[k]{(a_1\cdots a_k)(b_1\cdots b_k)}}{b_{k+1}b_k}\le\sum_{k=1}^{\infty}\dfrac{S_k}{b_{k+1}b_k}$，由比较判别法即得。
解析:
令 $S_k=\displaystyle\sum_{i=1}^k a_ib_i$，则 $a_kb_k=S_k-S_{k-1}$（$S_0=0$），即 $a_k=\dfrac{S_k-S_{k-1}}{b_k}$。

由 Abel 分部求和，

$$\sum_{k=1}^N a_k=\sum_{k=1}^N\frac{S_k-S_{k-1}}{b_k}=\sum_{k=1}^{N-1}\left(\frac{S_k}{b_k}-\frac{S_k}{b_{k+1}}\right)+\frac{S_N}{b_N}=\sum_{k=1}^{N-1}\frac{b_{k+1}-b_k}{b_kb_{k+1}}S_k+\frac{S_N}{b_N}\geq\delta\sum_{k=1}^{N-1}\frac{S_k}{b_kb_{k+1}}.$$

由于 $\displaystyle\sum_{k=1}^{+\infty}a_k$ 收敛，其部分和有界，所以 $\displaystyle\sum_{k=1}^{+\infty}\frac{S_k}{b_kb_{k+1}}$ 收敛。

又由几何-算术均值不等式，

$$\sqrt[k]{(a_1a_2\cdots a_k)(b_1b_2\cdots b_k)}\leq\frac{a_1b_1+a_2b_2+\cdots+a_kb_k}{k}=\frac{S_k}{k},$$

故

$$\sum_{k=1}^{+\infty}\frac{k\sqrt[k]{(a_1a_2\cdots a_k)(b_1b_2\cdots b_k)}}{b_{k+1}b_k}\leq\sum_{k=1}^{+\infty}\frac{S_k}{b_{k+1}b_k},$$

由比较判别法，结论成立。
