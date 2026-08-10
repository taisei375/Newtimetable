/* ==================================================
   storage.js
   時間割アプリ データ保存・読み込み
================================================== */


/* ==================================================
   保存先
================================================== */

const STORAGE_KEY = "timetableCalendarAppData";


/* ==================================================
   初期データ
================================================== */

function createInitialData() {

    return {

        /* 現在表示している時間割 */
        currentSchedule: 0,


        /* 現在選択しているカレンダーの日付 */
        selectedDate: getTodayString(),


        /* カレンダーで表示している年月 */
        calendarYear: new Date().getFullYear(),

        calendarMonth: new Date().getMonth(),


        /* 時間割 */
        schedules: [

            {
                id: createUniqueId(),

                name: "2026年度 前期",

                classes: {}
            }

        ],


        /* カレンダー予定 */
        events: {}

    };

}


/* ==================================================
   データ読み込み
================================================== */

function loadData() {

    try {

        const saved =
            localStorage.getItem(
                STORAGE_KEY
            );


        /*
            保存データがない場合
        */

        if (!saved) {

            const initialData =
                createInitialData();

            saveData(initialData);

            return initialData;

        }


        const data =
            JSON.parse(saved);


        /*
            古いデータや
            不完全なデータへの対策
        */

        return normalizeData(data);

    }

    catch (error) {

        console.error(
            "データの読み込みに失敗しました。",
            error
        );


        /*
            データが壊れていた場合は
            初期状態に戻す
        */

        const initialData =
            createInitialData();

        saveData(initialData);

        return initialData;

    }

}


/* ==================================================
   データ保存
================================================== */

function saveData(data) {

    try {

        localStorage.setItem(

            STORAGE_KEY,

            JSON.stringify(data)

        );

        return true;

    }

    catch (error) {

        console.error(
            "データの保存に失敗しました。",
            error
        );


        /*
            iPhoneなどで
            ストレージ容量が不足した場合
        */

        alert(
            "データを保存できませんでした。\n" +
            "ブラウザの保存容量を確認してください。"
        );

        return false;

    }

}


/* ==================================================
   データの整形
================================================== */

function normalizeData(data) {

    /*
        データがオブジェクトでない場合
    */

    if (
        !data ||
        typeof data !== "object"
    ) {

        return createInitialData();

    }


    /* -------------------------------
       schedules
    ------------------------------- */

    if (
        !Array.isArray(
            data.schedules
        ) ||
        data.schedules.length === 0
    ) {

        data.schedules = [
            {
                id: createUniqueId(),

                name: "2026年度 前期",

                classes: {}
            }
        ];

    }


    data.schedules.forEach(
        schedule => {

            if (!schedule.id) {

                schedule.id =
                    createUniqueId();

            }


            if (
                typeof schedule.name !==
                "string"
            ) {

                schedule.name =
                    "時間割";

            }


            if (
                !schedule.classes ||
                typeof schedule.classes !==
                "object"
            ) {

                schedule.classes = {};

            }

        }
    );


    /* -------------------------------
       currentSchedule
    ------------------------------- */

    if (
        typeof data.currentSchedule !==
        "number"
    ) {

        data.currentSchedule = 0;

    }


    /*
        範囲外になった場合
    */

    if (
        data.currentSchedule < 0 ||
        data.currentSchedule >=
        data.schedules.length
    ) {

        data.currentSchedule = 0;

    }


    /* -------------------------------
       events
    ------------------------------- */

    if (
        !data.events ||
        typeof data.events !== "object"
    ) {

        data.events = {};

    }


    /* -------------------------------
       selectedDate
    ------------------------------- */

    if (
        typeof data.selectedDate !==
        "string"
    ) {

        data.selectedDate =
            getTodayString();

    }


    /* -------------------------------
       calendarYear
    ------------------------------- */

    if (
        typeof data.calendarYear !==
        "number"
    ) {

        const now = new Date();

        data.calendarYear =
            now.getFullYear();

    }


    /* -------------------------------
       calendarMonth
    ------------------------------- */

    if (
        typeof data.calendarMonth !==
        "number"
    ) {

        const now = new Date();

        data.calendarMonth =
            now.getMonth();

    }


    /*
        月が範囲外なら修正
    */

    if (
        data.calendarMonth < 0 ||
        data.calendarMonth > 11
    ) {

        data.calendarMonth = 0;

    }


    return data;

}


/* ==================================================
   今日の日付を YYYY-MM-DD で取得
================================================== */

function getTodayString() {

    const today =
        new Date();


    const year =
        today.getFullYear();


    const month =
        String(
            today.getMonth() + 1
        ).padStart(2, "0");


    const day =
        String(
            today.getDate()
        ).padStart(2, "0");


    return `${year}-${month}-${day}`;

}


/* ==================================================
   日付を YYYY-MM-DD に変換
================================================== */

function formatDateString(
    year,
    month,
    day
) {

    const monthString =
        String(
            month + 1
        ).padStart(2, "0");


    const dayString =
        String(day)
            .padStart(2, "0");


    return `${year}-${monthString}-${dayString}`;

}


/* ==================================================
   日付文字列を安全に取得
================================================== */

function parseDateString(
    dateString
) {

    if (
        typeof dateString !==
        "string"
    ) {

        return null;

    }


    const parts =
        dateString.split("-");


    if (
        parts.length !== 3
    ) {

        return null;

    }


    const year =
        Number(parts[0]);

    const month =
        Number(parts[1]);

    const day =
        Number(parts[2]);


    if (
        !Number.isInteger(year) ||
        !Number.isInteger(month) ||
        !Number.isInteger(day)
    ) {

        return null;

    }


    const date =
        new Date(
            year,
            month - 1,
            day
        );


    /*
        不正な日付をチェック
    */

    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) {

        return null;

    }


    return date;

}


/* ==================================================
   一意なIDを作成
================================================== */

function createUniqueId() {

    return (

        Date.now().toString(36)

        +

        "-"

        +

        Math.random()
            .toString(36)
            .substring(2, 11)

    );

}


/* ==================================================
   現在の時間割を取得
================================================== */

function getCurrentSchedule(data) {

    if (
        !data ||
        !Array.isArray(data.schedules)
    ) {

        return null;

    }


    return data.schedules[
        data.currentSchedule
    ] || null;

}


/* ==================================================
   指定日の予定を取得
================================================== */

function getEventsForDate(
    data,
    dateString
) {

    if (
        !data ||
        !data.events
    ) {

        return [];

    }


    const events =
        data.events[dateString];


    if (
        !Array.isArray(events)
    ) {

        return [];

    }


    return events;

}


/* ==================================================
   指定日の予定を保存
================================================== */

function setEventsForDate(
    data,
    dateString,
    events
) {

    if (
        !data.events
    ) {

        data.events = {};

    }


    /*
        予定が0件なら
        空の配列を残さず削除
    */

    if (
        !Array.isArray(events) ||
        events.length === 0
    ) {

        delete data.events[
            dateString
        ];

    }
    else {

        data.events[
            dateString
        ] = events;

    }


    saveData(data);

}


/* ==================================================
   すべてのデータを削除
================================================== */

function clearAllData() {

    const result =
        confirm(
            "時間割とカレンダーのデータをすべて削除しますか？\n\n" +
            "この操作は元に戻せません。"
        );


    if (!result) {

        return false;

    }


    localStorage.removeItem(
        STORAGE_KEY
    );


    return true;

}
