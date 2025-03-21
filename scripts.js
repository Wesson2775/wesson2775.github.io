document.addEventListener("DOMContentLoaded", function () {
    // 设置网站起始日期（可根据实际日期修改）
    const startDate = new Date("2025-01-01");
    // 获取当前日期
    const currentDate = new Date();
    // 计算时间差（毫秒）
    const timeDiff = currentDate - startDate;
    // 转换为天数（四舍五入）
    const daysRunning = Math.round(timeDiff / (1000 * 60 * 60 * 24));
    // 更新到页面
    const runningDaysElement = document.getElementById("running-days");
    if (runningDaysElement) {
        runningDaysElement.textContent = daysRunning;
    }
});