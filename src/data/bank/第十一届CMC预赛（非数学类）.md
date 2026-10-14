## 2019 第十一届CMC预赛 非数学类 填空1
类型: 填空
知识点: 极限, 等价无穷小
难度: 3
分值: 5
题目: $\displaystyle\lim_{x\to0}\frac{\ln(e^{\sin x}+\sqrt[3]{1-\cos x})-\sin x}{\arctan(4\sqrt[3]{1-\cos x})}=$ ＿＿＿
答案: 1/4
备选: 0.25
解析:
$$\lim_{x\to0}\frac{\ln(e^{\sin x}+\sqrt[3]{1-\cos x})-\sin x}{\arctan(4\sqrt[3]{1-\cos x})}=\lim_{x\to0}\frac{\ln(e^{\sin x}+\sqrt[3]{1-\cos x})-\sin x}{4\sqrt[3]{1-\cos x}}-\lim_{x\to0}\frac{\sin x}{4\sqrt[3]{1-\cos x}}$$

$$=\lim_{x\to0}\frac{e^{\sin x}-1}{4\left(\dfrac{\sin x}{3}\right)^{1/3}}+\frac{1}{4}-\lim_{x\to0}\frac{\sin x}{4\left(\dfrac{x^2}{2}\right)^{1/3}}=\frac{1}{4}.$$

## 2019 第十一届CMC预赛 非数学类 填空2
类型: 填空
知识点: 隐函数, 不定积分, 参数代换
难度: 4
分值: 5
题目: 设隐函数 $y=y(x)$ 由方程 $y^2(x-y)=x^2$ 所确定，则 $\displaystyle\int\frac{dx}{y^2}=$ ＿＿＿
答案: 3y/x-2ln|y/x|+C
备选: \frac{3y}{x}-2\ln|\frac{y}{x}|+C
解析:
令 $y=tx$，则 $x=\dfrac{1}{t^2(1-t)}$，$y=\dfrac{1}{t(1-t)}$，$dx=\dfrac{-2+3t}{t^3(1-t)^2}dt$。

这样，

$$\int\frac{dx}{y^2}=\int\frac{-2+3t}{t}dt=3t-2\ln|t|+C=\frac{3y}{x}-2\ln\left|\frac{y}{x}\right|+C.$$

## 2019 第十一届CMC预赛 非数学类 填空3
类型: 填空
知识点: 定积分, 分部积分, 三角恒等变换
难度: 3
分值: 5
题目: 定积分 $\displaystyle\int_0^{\frac{\pi}{2}}\frac{e^x(1+\sin x)}{1+\cos x}dx=$ ＿＿＿
答案: e^(pi/2)
备选: e^{\pi/2}, \exp(\pi/2)
解析:
$$\int_0^{\frac{\pi}{2}}\frac{e^x(1+\sin x)}{1+\cos x}dx=\int_0^{\frac{\pi}{2}}\frac{e^x}{1+\cos x}dx+\int_0^{\frac{\pi}{2}}\frac{\sin x}{1+\cos x}de^x$$

$$=\int_0^{\frac{\pi}{2}}\frac{e^x}{1+\cos x}dx+\frac{\sin xe^x}{1+\cos x}\bigg|_0^{\frac{\pi}{2}}-\int_0^{\frac{\pi}{2}}e^x\frac{\cos x(1+\cos x)+\sin^2 x}{(1+\cos x)^2}dx$$

$$=\int_0^{\frac{\pi}{2}}\frac{e^x}{1+\cos x}dx+\frac{\sin xe^x}{1+\cos x}\bigg|_0^{\frac{\pi}{2}}-\int_0^{\frac{\pi}{2}}\frac{e^x}{1+\cos x}dx=e^{\frac{\pi}{2}}.$$

## 2019 第十一届CMC预赛 非数学类 填空4
类型: 解答
知识点: 全微分求积, 曲线积分与路径无关
难度: 4
分值: 14
题目: 已知 $du(x,y)=\dfrac{ydx-xdy}{3x^2-2xy+3y^2}$，则 $u(x,y)=$
答案: 见结论：$u(x,y)=\dfrac{1}{2\sqrt{2}}\arctan\dfrac{3}{2\sqrt{2}}\left(\dfrac{x}{y}-\dfrac{1}{3}\right)+C$。用 $t=\dfrac{x}{y}$ 换元，$du=\dfrac{dt}{3t^2-2t+3}$，配方后作 $\arctan$ 换元即可。
解析:
$$du(x,y)=\frac{ydx-xdy}{3x^2-2xy+3y^2}=\frac{d\left(\dfrac{x}{y}\right)}{3\left(\dfrac{x}{y}\right)^2-2\dfrac{x}{y}+3}=\frac{1}{2\sqrt{2}}d\arctan\frac{3}{2\sqrt{2}}\left(\frac{x}{y}-\frac{1}{3}\right),$$

所以 $u(x,y)=\dfrac{1}{2\sqrt{2}}\arctan\dfrac{3}{2\sqrt{2}}\left(\dfrac{x}{y}-\dfrac{1}{3}\right)+C$。

## 2019 第十一届CMC预赛 非数学类 填空5
类型: 填空
知识点: 多元函数微分, 条件极值, 拉格朗日乘数法
难度: 4
分值: 5
题目: 设 $a,b,c,\mu>0$，曲面 $xyz=\mu$ 与曲面 $\dfrac{x^2}{a^2}+\dfrac{y^2}{b^2}+\dfrac{z^2}{c^2}=1$ 相切，则 $\mu=$ ＿＿＿
答案: abc/(3*sqrt(3))
备选: \frac{abc}{3\sqrt{3}}
解析:
根据题意有 $yz=\dfrac{2x}{a^2}\lambda$，$xz=\dfrac{2y}{b^2}\lambda$，$xy=\dfrac{2z}{c^2}\lambda$，以及

$\mu=2\lambda\dfrac{x^2}{a^2}$，$\mu=2\lambda\dfrac{y^2}{b^2}$，$\mu=2\lambda\dfrac{z^2}{c^2}$，从而得 $\mu=\dfrac{8\lambda^3}{a^2b^2c^2}$，$3\mu=2\lambda$。

联立解得 $\mu=\dfrac{abc}{3\sqrt{3}}$。

## 2019 第十一届CMC预赛 非数学类 解答二
类型: 解答
知识点: 三重积分, 球面坐标
难度: 4
分值: 14
题目: （14 分）计算三重积分 $\displaystyle\iiint_{\Omega}\frac{xyz}{x^2+y^2}dxdydz$，其中 $\Omega$ 是由曲面 $(x^2+y^2+z^2)^2=2xy$ 围成的区域在第一卦限部分。
答案: $\dfrac{1}{72}$
解析:
采用"球面坐标"计算，并利用对称性，得

$$I=2\int_0^{\frac{\pi}{4}}d\theta\int_0^{\frac{\pi}{2}}d\varphi\int_0^{\sqrt{2\sin\varphi\sin\theta\cos\varphi}}\frac{\rho^3\sin^2\varphi\cos\theta\sin\theta\cos\varphi}{\rho^2\sin^2\varphi}\rho^2\sin\varphi d\rho$$

$$=2\int_0^{\frac{\pi}{4}}\sin\theta\cos\theta d\theta\int_0^{\frac{\pi}{2}}\sin\varphi\cos\varphi d\varphi\int_0^{\sqrt{2\sin\varphi\sin\theta\cos\varphi}}\rho^3 d\rho$$

$$=2\int_0^{\frac{\pi}{4}}\sin^3\theta\cos^3\theta d\theta\int_0^{\frac{\pi}{2}}\sin^5\varphi\cos\varphi d\varphi$$

$$=\frac{1}{4}\int_0^{\frac{\pi}{4}}\sin^3 2\theta d\theta\int_0^{\frac{\pi}{2}}\sin^5\varphi d(\sin\varphi)$$

$$=\frac{1}{48}\int_0^{\frac{\pi}{4}}\sin^3 t\,dt=\frac{1}{48}\cdot\frac{2}{3}=\frac{1}{72}.$$

## 2019 第十一届CMC预赛 非数学类 解答三
类型: 解答
知识点: 微分中值定理, 不等式, 迭代估计
难度: 5
分值: 14
题目: （14 分）设 $f(x)$ 在 $[0,+\infty)$ 上可微，$f(0)=0$，且存在常数 $A>0$，使得 $|f'(x)|\leq A|f(x)|$ 在 $[0,+\infty)$ 上成立。试证明：在 $[0,+\infty)$ 上有 $f(x)=0$。
答案: 见结论：$f(x)\equiv0$，$\forall x\in[0,+\infty)$。先证 $f$ 在 $\left[0,\dfrac1{2A}\right]$ 上恒为零（由 $|f(x_0)|\le A|f(x_0)|\cdot\dfrac1{2A}$），再逐段递推。
解析:
证明：设 $x_0\in\left[0,\dfrac{1}{2A}\right]$，使得 $\left|f(x_0)\right|=\max\left\{|f(x)|\,|\,x\in\left[0,\dfrac{1}{2A}\right]\right\}$，则

$$\left|f(x_0)\right|=\left|f(0)+f'(\xi)x_0\right|\leq A\left|f(x_0)\right|\cdot\frac{1}{2A}=\frac{1}{2}\left|f(x_0)\right|,$$

只有 $\left|f(x_0)\right|=0$。

故当 $x\in\left[0,\dfrac{1}{2A}\right]$ 时，$f(x)=0$。

递推可得，对所有的 $x\in\left[\dfrac{k-1}{2A},\dfrac{k}{2A}\right]$，$k=1,2,\cdots$，均有 $f(x)=0$。

即 $f(x)\equiv0$，$x\in[0,+\infty)$。

## 2019 第十一届CMC预赛 非数学类 解答四
类型: 解答
知识点: 第一型曲面积分, 曲面积分, 对称性
难度: 5
分值: 14
题目: （14 分）计算积分 $I=\displaystyle\int_0^{\pi}d\varphi\int_0^{\pi}e^{\sin\theta(\cos\varphi-\sin\varphi)}\sin\theta d\theta$。
答案: $\sqrt{2}\pi\left(e^{\sqrt{2}}-e^{-\sqrt{2}}\right)$
解析:
设球面 $\Sigma: x^2+y^2+z^2=1$，由球面参数方程

$$x=\sin\theta\cos\varphi,\quad y=\sin\theta\sin\varphi,\quad z=\cos\theta$$

知 $dS=\sin\theta d\theta d\varphi$，所以所求积分可化为第一型曲面积分

$$I=\iint_{\Sigma}e^{x-y}dS.$$

设平面 $P_t:\dfrac{x-y}{\sqrt{2}}=t$，$-1\leq t\leq1$，其中 $t$ 为平面 $P_t$ 被球面截下部分中心到原点距离。

用平面 $P_t$ 分割球面 $\Sigma$，球面在平面 $P_t,P_{t+dt}$ 之间的部分形如圆台外表形状，记为 $\Sigma_{t,dt}$，被积函数在其上为 $e^{x-y}=e^{\sqrt{2}t}$。

由于 $\Sigma_{t,dt}$ 半径为 $r_t=\sqrt{1-t^2}$，半径的增长率为 $d\sqrt{1-t^2}=\dfrac{-t\,dt}{\sqrt{1-t^2}}$ 就是 $\Sigma_{t,dt}$ 上下底半径之差。记圆台外表面斜高为 $h_t$，则由微元法知 $dt^2+\left(d\sqrt{1-t^2}\right)^2=h_t^2$，得到 $h_t=\dfrac{dt}{\sqrt{1-t^2}}$，所以 $\Sigma_{t,dt}$ 的面积为 $dS=2\pi r_t h_t=2\pi dt$，

$$I=\int_{-1}^{1}e^{\sqrt{2}t}\,2\pi dt=\frac{2\pi}{\sqrt{2}}e^{\sqrt{2}t}\Big|_{-1}^{1}=\sqrt{2}\pi\left(e^{\sqrt{2}}-e^{-\sqrt{2}}\right).$$

## 2019 第十一届CMC预赛 非数学类 解答五
类型: 解答
知识点: 幂级数, 多项式根, 极限
难度: 5
分值: 14
题目: （14 分）设 $f(x)$ 是仅有正实根的多项式函数，满足 $\dfrac{f'(x)}{f(x)}=-\displaystyle\sum_{n=0}^{+\infty}c_nx^n$。试证：$c_n>0$（$n\geq0$），极限 $\displaystyle\lim_{n\to\infty}\frac{1}{\sqrt[n]{c_n}}$ 存在，且等于 $f(x)$ 的最小根。
答案: 见结论：$c_n>0$（$n\ge0$），且 $\displaystyle\lim_{n\to\infty}\dfrac{1}{\sqrt[n]{c_n}}$ 存在并等于 $f(x)$ 的最小正根 $a_1$。
解析:
证明：由 $f(x)$ 为仅有正实根的多项式，不妨设 $f(x)$ 的全部根为 $0<a_1<a_2<\cdots<a_k$，这样

$$f(x)=A(x-a_1)^{r_1}\cdots(x-a_k)^{r_k},$$

其中 $r_i$ 为对应根 $a_i$ 的重数（$i=1,\cdots,k$，$r_k\geq1$）。

$$f'(x)=Ar_1(x-a_1)^{r_1-1}\cdots(x-a_k)^{r_k}+\cdots+Ar_k(x-a_1)^{r_1}\cdots(x-a_k)^{r_k-1},$$

所以 $f'(x)=f(x)\left(\dfrac{r_1}{x-a_1}+\cdots+\dfrac{r_k}{x-a_k}\right)$，从而

$$-\frac{f'(x)}{f(x)}=\frac{r_1}{a_1}\cdot\frac{1}{1-\frac{x}{a_1}}+\cdots+\frac{r_k}{a_k}\cdot\frac{1}{1-\frac{x}{a_k}}.$$

若 $|x|<a_1$，则

$$-\frac{f'(x)}{f(x)}=\frac{r_1}{a_1}\cdot\sum_{n=0}^{\infty}\left(\frac{x}{a_1}\right)^n+\cdots+\frac{r_k}{a_k}\cdot\sum_{n=0}^{\infty}\left(\frac{x}{a_k}\right)^n=\sum_{n=0}^{\infty}\left(\frac{r_1}{a_1^{n+1}}+\cdots+\frac{r_k}{a_k^{n+1}}\right)x^n.$$

而 $-\dfrac{f'(x)}{f(x)}=\displaystyle\sum_{n=0}^{\infty}c_nx^n$，由幂级数的唯一性知

$$c_n=\frac{r_1}{a_1^{n+1}}+\cdots+\frac{r_k}{a_k^{n+1}}>0,$$

$$\frac{c_n}{c_{n+1}}=\frac{\frac{r_1}{a_1^{n+1}}+\cdots+\frac{r_k}{a_k^{n+1}}}{\frac{r_1}{a_1^{n+2}}+\cdots+\frac{r_k}{a_k^{n+2}}}=a_1\cdot\frac{r_1+\cdots+\left(\frac{a_1}{a_k}\right)^{n+1}r_k}{r_1+\cdots+\left(\frac{a_1}{a_k}\right)^{n+2}r_k}.$$

$$\lim_{n\to\infty}\frac{c_n}{c_{n+1}}=a_1\cdot\frac{r_1+0+\cdots+0}{r_1+0+\cdots+0}=a_1>0,\qquad \lim_{n\to\infty}\frac{c_{n+1}}{c_n}=\frac{1}{a_1},$$

$$\lim_{n\to\infty}\frac{1}{n}\left(\ln\frac{c_2}{c_1}+\cdots+\ln\frac{c_{n+1}}{c_n}\right)=\ln\frac{1}{a_1},$$

$$\sqrt[n]{c_n}=e^{\frac{\ln c_n}{n}}=e^{\ln c_1+\frac{1}{n}\left(\ln\frac{c_2}{c_1}+\cdots+\ln\frac{c_{n+1}}{c_n}\right)}\to e^{\ln\frac{1}{a_1}}=\frac{1}{a_1}.$$

从而 $\displaystyle\lim_{n\to\infty}\frac{1}{\sqrt[n]{c_n}}=a_1$，即 $f(x)$ 的最小正根。

## 2019 第十一届CMC预赛 非数学类 解答六
类型: 解答
知识点: 常微分方程, 反证法, 积分不等式
难度: 5
分值: 14
题目: （14 分）设函数 $f(x)$ 在 $[0,+\infty)$ 上具有连续导数，满足 $3\left[3+f^2(x)\right]f'(x)=2\left[1+f^2(x)\right]^2e^{-x^2}$，且 $f(0)\leq1$。证明：存在常数 $M>0$，使得 $x\in[0,+\infty)$ 时，恒有 $|f(x)|\leq M$。
答案: 见结论：存在常数 $M>0$ 使 $|f(x)|\le M$。由 $g(u)=\dfrac{u}{1+u^2}+2\arctan u$ 严格递增且 $g(f(0))\le\dfrac{1+\pi}{2}$ 推出矛盾，得 $L=\lim_{x\to+\infty}f(x)$ 有限，取 $M=\max\{|f(0)|,|L|\}$。
解析:
证明：由于 $f'(x)>0$，所以 $f(x)$ 是 $[0,+\infty)$ 上的严格增函数，故 $\displaystyle\lim_{x\to+\infty}f(x)=L$（有限或为 $+\infty$）。下面证明 $L\neq+\infty$。

记 $y=f(x)$，将所给等式分离变量并积分得

$$\int\frac{3+y^2}{(1+y^2)^2}dy=\frac{2}{3}\int e^{-x^2}dx,$$

即

$$\frac{y}{1+y^2}+2\arctan y=\frac{2}{3}\int_0^x e^{-t^2}dt+C,$$

其中 $C=\dfrac{f(0)}{1+f^2(0)}+2\arctan f(0)$。

若 $L=+\infty$，则对上式取极限 $x\to+\infty$，并利用 $\displaystyle\int_0^{+\infty}e^{-t^2}dt=\frac{\sqrt{\pi}}{2}$，得 $C=\pi-\dfrac{\sqrt{\pi}}{3}$。

另一方面，令 $g(u)=\dfrac{u}{1+u^2}+2\arctan u$，则 $g'(u)=\dfrac{3+u^2}{(1+u^2)^2}>0$，所以函数 $g(u)$ 在 $(-\infty,+\infty)$ 上严格单调增加。因此，当 $f(0)\leq1$ 时，$C=g(f(0))\leq g(1)=\dfrac{1+\pi}{2}$，但 $C>\dfrac{2\pi-\sqrt{\pi}}{2}>\dfrac{1+\pi}{2}$，矛盾。这就证明了 $\displaystyle\lim_{x\to+\infty}f(x)=L$ 为有限数。

最后，取 $M=\max\left\{|f(0)|,|L|\right\}$，则 $|f(x)|\leq M$，$\forall x\in[0,+\infty)$。
