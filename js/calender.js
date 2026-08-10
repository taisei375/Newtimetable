/* ==================================================
   calendar.js
   カレンダー機能
================================================== */


/* ==================================================
   曜日
================================================== */

const CALENDAR_WEEKDAYS = [
    "日",
    "月",
    "火",
    "水",
    "木",
    "金",
    "土"
];


/* ==================================================
   カレンダー描画
================================================== */

function renderCalendar(data) {

    const calendar =
        document.getElementById("calendar");

    const title =
        document.getElementById("calendarTitle");


    if (!calendar || !title) {
        return;
    }


    /*
        カレンダーを空にする
    */

    calendar.innerHTML = "";


    const year =
        data.calendarYear;

    const month =
        data.calendarMonth;


    /*
        タイトル
    */

    title.textContent =
        `${year}年${month + 1}月`;


    /*
        曜日を表示
    */

    CALENDAR_WEEKDAYS.forEach(
        weekday => {

            const element =
                document.createElement("div");

            element.className =
                "calendar-weekday";

            element.textContent =
                weekday;

            calendar.appendChild(
                element
            );

        }
    );


    /*
        月初の曜日
    */

    const firstDay =
        new Date(
            year,
            month,
            1
        ).getDay();


    /*
        月の日数
    */

    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    /*
        前月の日数
    */

    const daysInPreviousMonth =
        new Date(
            year,
            month,
            0
        ).getDate();


    /*
        カレンダーは
        前月 + 今月 + 次月
        を最大42マス表示
    */

    const totalCells = 42;


    for (
        let i = 0;
        i < totalCells;
        i++
    ) {

        let dayNumber;

        let cellYear =
            year;

        let cellMonth =
            month;

        let isOtherMonth =
            false;


        /*
            前月
        */

        if (i < firstDay) {

            dayNumber =
                daysInPreviousMonth -
                firstDay +
                i +
                1;


            cellMonth =
                month - 1;


            if (
                cellMonth < 0
            ) {

                cellMonth = 11;

                cellYear--;

            }


            isOtherMonth = true;

        }

        /*
            今月
        */

        else if (
            i <
            firstDay +
            daysInMonth
        ) {

            dayNumber =
                i -
                firstDay +
                1;

        }

        /*
            次月
        */

        else {

            dayNumber =
                i -
                (
                    firstDay +
                    daysInMonth
                ) +
                1;


            cellMonth =
                month + 1;


            if (
                cellMonth > 11
            ) {

                cellMonth = 0;

                cellYear++;

            }


            isOtherMonth = true;

        }


        /*
            日付文字列
        */

        const dateString =
            formatDateString(
                cellYear,
                cellMonth,
                dayNumber
            );


        /*
            セル
        */

        const cell =
            document.createElement("div");

        cell.className =
            "calendar-day";


        if (isOtherMonth) {

            cell.classList.add(
                "other-month"
            );

        }


        /*
            今日
        */

        const today =
            getTodayString();


        if (
            dateString === today
        ) {

            cell.classList.add(
                "today"
            );

        }


        /*
            選択中
        */

        if (
            dateString ===
            data.selectedDate
        ) {

            cell.classList.add(
                "selected"
            );

        }


        /*
            日付番号
        */

        const number =
            document.createElement("div");

        number.className =
            "day-number";


        if (
            dateString === today
        ) {

            number.classList.add(
                "today-number"
            );

        }


        number.textContent =
            dayNumber;


        cell.appendChild(
            number
        );


        /*
            予定
        */

        const events =
            getEventsForDate(
                data,
                dateString
            );


        events.forEach(
            event => {

                const eventElement =
                    createCalendarEventElement(
                        event
                    );


                /*
                    予定をクリックした場合
                    日付クリックと
                    重複しないようにする
                */

                eventElement.addEventListener(
                    "click",
                    function(eventObject) {

                        eventObject.stopPropagation();


                        if (
                            typeof openEventModal ===
                            "function"
                        ) {

                            openEventModal(
                                event.id,
                                dateString
                            );

                        }

                    }
                );


                cell.appendChild(
                    eventElement
                );

            }
        );


        /*
            日付クリック
        */

        cell.addEventListener(
            "click",
            function() {

                selectCalendarDate(
                    data,
                    dateString
                );

            }
        );


        calendar.appendChild(
            cell
        );

    }


    /*
        選択日の予定を更新
    */

    renderSelectedDateEvents(
        data
    );

}


/* ==================================================
   カレンダー予定表示
================================================== */

function createCalendarEventElement(
    event
) {

    const element =
        document.createElement("div");


    element.className =
        "calendar-event";


    /*
        時刻
    */

    const time =
        document.createElement("span");

    time.className =
        "calendar-event-time";


    if (
        event.startTime
    ) {

        time.textContent =
            event.startTime;

    }


    /*
        タイトル
    */

    const title =
        document.createElement("span");


    title.textContent =
        event.title ||
        "予定";


    element.appendChild(
        time
    );

    element.appendChild(
        title
    );


    return element;

}


/* ==================================================
   選択日を変更
================================================== */

function selectCalendarDate(
    data,
    dateString
) {

    data.selectedDate =
        dateString;


    saveData(data);


    renderCalendar(
        data
    );

}


/* ==================================================
   選択日の予定を表示
================================================== */

function renderSelectedDateEvents(
    data
) {

    const title =
        document.getElementById(
            "selectedDateTitle"
        );


    const list =
        document.getElementById(
            "eventList"
        );


    if (!title || !list) {
        return;
    }


    const dateString =
        data.selectedDate;


    const date =
        parseDateString(
            dateString
        );


    if (!date) {

        title.textContent =
            "予定";

        list.innerHTML = "";

        return;

    }


    /*
        日本語の日付
    */

    const weekday =
        CALENDAR_WEEKDAYS[
            date.getDay()
        ];


    title.textContent =
        `${date.getFullYear()}年` +
        `${date.getMonth() + 1}月` +
        `${date.getDate()}日` +
        `（${weekday}）`;


    list.innerHTML = "";


    const events =
        getEventsForDate(
            data,
            dateString
        );


    /*
        予定がない場合
    */

    if (
        events.length === 0
    ) {

        const empty =
            document.createElement("div");

        empty.className =
            "no-events";

        empty.textContent =
            "予定はありません。";

        list.appendChild(
            empty
        );

        return;

    }


    /*
        時刻順に並べる
    */

    const sortedEvents =
        [...events].sort(
            (a, b) => {

                const timeA =
                    a.startTime || "99:99";

                const timeB =
                    b.startTime || "99:99";

                return timeA.localeCompare(
                    timeB
                );

            }
        );


    sortedEvents.forEach(
        event => {

            const item =
                document.createElement("div");

            item.className =
                "event-item";


            /*
                メイン
            */

            const main =
                document.createElement("div");

            main.className =
                "event-main";


            /*
                タイトル
            */

            const eventTitle =
                document.createElement("div");

            eventTitle.className =
                "event-title";

            eventTitle.textContent =
                event.title ||
                "予定";


            main.appendChild(
                eventTitle
            );


            /*
                時間
            */

            if (
                event.startTime ||
                event.endTime
            ) {

                const time =
                    document.createElement("div");

                time.className =
                    "event-time";


                if (
                    event.startTime &&
                    event.endTime
                ) {

                    time.textContent =
                        `${event.startTime}〜${event.endTime}`;

                }

                else if (
                    event.startTime
                ) {

                    time.textContent =
                        event.startTime;

                }

                else {

                    time.textContent =
                        event.endTime;

                }


                main.appendChild(
                    time
                );

            }


            /*
                メモ
            */

            if (
                event.memo
            ) {

                const memo =
                    document.createElement("div");

                memo.className =
                    "event-memo";

                memo.textContent =
                    event.memo;

                main.appendChild(
                    memo
                );

            }


            /*
                矢印
            */

            const arrow =
                document.createElement("div");

            arrow.className =
                "event-arrow";

            arrow.textContent =
                "›";


            item.appendChild(
                main
            );

            item.appendChild(
                arrow
            );


            /*
                編集
            */

            item.addEventListener(
                "click",
                function() {

                    if (
                        typeof openEventModal ===
                        "function"
                    ) {

                        openEventModal(
                            event.id,
                            dateString
                        );

                    }

                }
            );


            list.appendChild(
                item
            );

        }
    );

}


/* ==================================================
   月を変更
================================================== */

function changeCalendarMonth(
    data,
    amount
) {

    let year =
        data.calendarYear;

    let month =
        data.calendarMonth;


    month += amount;


    /*
        翌年
    */

    if (
        month > 11
    ) {

        month = 0;

        year++;

    }


    /*
        前年
    */

    if (
        month < 0
    ) {

        month = 11;

        year--;

    }


    data.calendarYear =
        year;

    data.calendarMonth =
        month;


    saveData(data);


    renderCalendar(
        data
    );

}


/* ==================================================
   今日へ移動
================================================== */

function goToToday(
    data
) {

    const today =
        new Date();


    data.calendarYear =
        today.getFullYear();


    data.calendarMonth =
        today.getMonth();


    data.selectedDate =
        getTodayString();


    saveData(data);


    renderCalendar(
        data
    );

}


/* ==================================================
   予定を保存
================================================== */

function saveEventData(
    data,
    eventInfo,
    editingEventId = null
) {

    const dateString =
        eventInfo.date;


    /*
        日付チェック
    */

    if (
        !parseDateString(
            dateString
        )
    ) {

        return {
            success: false,
            message:
                "日付を正しく入力してください。"
        };

    }


    /*
        タイトル
    */

    const title =
        String(
            eventInfo.title || ""
        ).trim();


    if (!title) {

        return {
            success: false,
            message:
                "予定名を入力してください。"
        };

    }


    /*
        時間チェック
    */

    if (
        eventInfo.startTime &&
        eventInfo.endTime &&
        eventInfo.startTime >
        eventInfo.endTime
    ) {

        return {
            success: false,
            message:
                "終了時刻は開始時刻より後にしてください。"
        };

    }


    /*
        予定配列
    */

    if (
        !Array.isArray(
            data.events[dateString]
        )
    ) {

        data.events[dateString] =
            [];

    }


    /*
        編集
    */

    if (
        editingEventId
    ) {

        let found = false;


        /*
            全日付から編集対象を探す
        */

        Object.keys(
            data.events
        ).forEach(
            date => {

                const events =
                    data.events[date];


                const index =
                    events.findIndex(
                        event =>
                            event.id ===
                            editingEventId
                    );


                if (
                    index !== -1
                ) {

                    /*
                        日付が変わった場合
                    */

                    const oldEvent =
                        events[index];


                    events.splice(
                        index,
                        1
                    );


                    if (
                        events.length === 0
                    ) {

                        delete data.events[
                            date
                        ];

                    }


                    /*
                        元のデータを保持
                    */

                    found = true;

                }

            }
        );


        /*
            IDをそのまま使用
        */

        if (!found) {

            editingEventId =
                createUniqueId();

        }

    }


    const eventId =
        editingEventId ||
        createUniqueId();


    const newEvent = {

        id: eventId,

        date: dateString,

        title: title,

        startTime:
            eventInfo.startTime || "",

        endTime:
            eventInfo.endTime || "",

        memo:
            String(
                eventInfo.memo || ""
            ).trim()

    };


    /*
        保存
    */

    if (
        !Array.isArray(
            data.events[dateString]
        )
    ) {

        data.events[dateString] =
            [];

    }


    data.events[dateString].push(
        newEvent
    );


    /*
        日付を選択
    */

    data.selectedDate =
        dateString;


    /*
        保存
    */

    saveData(data);


    /*
        カレンダーの表示年月も
        予定の日付に合わせる
    */

    const date =
        parseDateString(
            dateString
        );


    if (date) {

        data.calendarYear =
            date.getFullYear();

        data.calendarMonth =
            date.getMonth();

    }


    saveData(data);


    return {
        success: true,

        eventId: eventId
    };

}


/* ==================================================
   予定削除
================================================== */

function deleteEventData(
    data,
    eventId
) {

    let deleted =
        false;


    Object.keys(
        data.events
    ).forEach(
        dateString => {

            const events =
                data.events[
                    dateString
                ];


            if (
                !Array.isArray(events)
            ) {

                return;

            }


            const newEvents =
                events.filter(
                    event => {

                        if (
                            event.id ===
                            eventId
                        ) {

                            deleted =
                                true;

                            return false;

                        }

                        return true;

                    }
                );


            if (
                newEvents.length === 0
            ) {

                delete data.events[
                    dateString
                ];

            }
            else {

                data.events[
                    dateString
                ] = newEvents;

            }

        }
    );


    if (deleted) {

        saveData(data);

    }


    return deleted;

}


/* ==================================================
   予定を取得
================================================== */

function getEventById(
    data,
    eventId
) {

    for (
        const dateString of
        Object.keys(
            data.events
        )
    ) {

        const events =
            data.events[
                dateString
            ];


        if (
            !Array.isArray(events)
        ) {

            continue;

        }


        const event =
            events.find(
                item =>
                    item.id ===
                    eventId
            );


        if (event) {

            return event;

        }

    }


    return null;

}


/* ==================================================
   月内の予定数を取得
================================================== */

function getEventCountForDate(
    data,
    dateString
) {

    const events =
        getEventsForDate(
            data,
            dateString
        );


    return events.length;

}
