/* ==================================================
   app.js
   アプリ全体の制御
================================================== */


/* ==================================================
   アプリデータ
================================================== */

window.appData = null;


/* ==================================================
   初期化
================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        /*
            データ読み込み
        */

        window.appData =
            loadData();


        /*
            各機能のイベント設定
        */

        setupTimetableEvents();

        setupCalendarEvents();

        setupScheduleEvents();

        setupModalEvents();


        /*
            初期表示
        */

        renderAll();

    }
);


/* ==================================================
   全体表示
================================================== */

function renderAll() {

    const data =
        window.appData;


    if (!data) {
        return;
    }


    /*
        時間割
    */

    renderTimetable(
        data
    );


    /*
        カレンダー
    */

    renderCalendar(
        data
    );


    /*
        時間割一覧
    */

    renderScheduleSelect(
        data
    );


    /*
        合計単位
    */

    updateTotalCredits(
        data
    );

}


/* ==================================================
   時間割関連イベント
================================================== */

function setupTimetableEvents() {

    /*
        授業追加ボタン
    */

    document
        .getElementById(
            "addClassButton"
        )
        ?.addEventListener(
            "click",
            function() {

                openClassModal();

            }
        );


    /*
        時間割名変更
    */

    document
        .getElementById(
            "renameScheduleButton"
        )
        ?.addEventListener(
            "click",
            function() {

                const data =
                    window.appData;


                const schedule =
                    getCurrentSchedule(
                        data
                    );


                if (!schedule) {
                    return;
                }


                const newName =
                    prompt(
                        "時間割名を入力してください。",
                        schedule.name
                    );


                if (
                    newName === null
                ) {

                    return;

                }


                const result =
                    renameCurrentSchedule(
                        data,
                        newName
                    );


                if (!result.success) {

                    alert(
                        result.message ||
                        "変更できませんでした。"
                    );

                    return;

                }


                renderAll();

            }
        );


    /*
        時間割削除
    */

    document
        .getElementById(
            "deleteScheduleButton"
        )
        ?.addEventListener(
            "click",
            function() {

                const result =
                    deleteCurrentSchedule(
                        window.appData
                    );


                if (!result.success) {

                    alert(
                        result.message
                    );

                    return;

                }


                renderAll();

            }
        );

}


/* ==================================================
   時間割選択
================================================== */

function renderScheduleSelect(
    data
) {

    const select =
        document.getElementById(
            "scheduleSelect"
        );


    if (!select) {
        return;
    }


    select.innerHTML = "";


    data.schedules.forEach(
        (schedule, index) => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                index;


            option.textContent =
                schedule.name;


            if (
                index ===
                data.currentSchedule
            ) {

                option.selected =
                    true;

            }


            select.appendChild(
                option
            );

        }
    );

}


/* ==================================================
   時間割切り替え
================================================== */

function setupScheduleEvents() {

    /*
        時間割選択
    */

    document
        .getElementById(
            "scheduleSelect"
        )
        ?.addEventListener(
            "change",
            function() {

                const index =
                    Number(
                        this.value
                    );


                if (
                    !Number.isInteger(
                        index
                    )
                ) {

                    return;

                }


                if (
                    index < 0 ||
                    index >=
                    window.appData.schedules.length
                ) {

                    return;

                }


                window.appData.currentSchedule =
                    index;


                saveData(
                    window.appData
                );


                renderTimetable(
                    window.appData
                );


                updateTotalCredits(
                    window.appData
                );

            }
        );


    /*
        新しい時間割
    */

    document
        .getElementById(
            "addScheduleButton"
        )
        ?.addEventListener(
            "click",
            function() {

                const name =
                    prompt(
                        "新しい時間割の名前を入力してください。",
                        `時間割${window.appData.schedules.length + 1}`
                    );


                if (
                    name === null
                ) {

                    return;

                }


                const result =
                    addNewSchedule(
                        window.appData,
                        name
                    );


                if (!result.success) {

                    alert(
                        result.message
                    );

                    return;

                }


                renderAll();

            }
        );

}


/* ==================================================
   カレンダー関連イベント
================================================== */

function setupCalendarEvents() {

    /*
        前月
    */

    document
        .getElementById(
            "previousMonthButton"
        )
        ?.addEventListener(
            "click",
            function() {

                changeCalendarMonth(
                    window.appData,
                    -1
                );

            }
        );


    /*
        次月
    */

    document
        .getElementById(
            "nextMonthButton"
        )
        ?.addEventListener(
            "click",
            function() {

                changeCalendarMonth(
                    window.appData,
                    1
                );

            }
        );


    /*
        今日
    */

    document
        .getElementById(
            "todayButton"
        )
        ?.addEventListener(
            "click",
            function() {

                goToToday(
                    window.appData
                );

            }
        );


    /*
        予定追加
    */

    document
        .getElementById(
            "addEventButton"
        )
        ?.addEventListener(
            "click",
            function() {

                openEventModal(
                    null,
                    window.appData.selectedDate
                );

            }
        );

}


/* ==================================================
   キーボード操作
================================================== */

document.addEventListener(
    "keydown",
    function(event) {

        /*
            Ctrl + S
            データ保存
        */

        if (
            (event.ctrlKey ||
             event.metaKey) &&
            event.key.toLowerCase() ===
            "s"
        ) {

            event.preventDefault();


            if (
                window.appData
            ) {

                saveData(
                    window.appData
                );

            }

        }

    }
);


/* ==================================================
   ページを離れる前に保存
================================================== */

window.addEventListener(
    "beforeunload",
    function() {

        if (
            window.appData
        ) {

            saveData(
                window.appData
            );

        }

    }
);
