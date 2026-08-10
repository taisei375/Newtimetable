/* ==================================================
   timetable.js
   時間割機能
================================================== */


/* ==================================================
   基本設定
================================================== */

const TIMETABLE_DAYS = [
    "月",
    "火",
    "水",
    "木",
    "金"
];

const TIMETABLE_PERIODS = [
    1,
    2,
    3,
    4,
    5
];


/* ==================================================
   時間割を表示
================================================== */

function renderTimetable(data) {

    const tbody =
        document.getElementById(
            "timetableBody"
        );


    if (!tbody) {
        return;
    }


    tbody.innerHTML = "";


    const schedule =
        getCurrentSchedule(data);


    if (!schedule) {
        return;
    }


    /*
        時間割名
    */

    const title =
        document.getElementById(
            "scheduleTitle"
        );


    if (title) {

        title.textContent =
            schedule.name;

    }


    /*
        1〜5限を作成
    */

    TIMETABLE_PERIODS.forEach(
        period => {

            const row =
                document.createElement(
                    "tr"
                );


            /*
                時限
            */

            const periodCell =
                document.createElement(
                    "td"
                );

            periodCell.className =
                "period-column";

            periodCell.textContent =
                `${period}限`;

            row.appendChild(
                periodCell
            );


            /*
                月〜金
            */

            TIMETABLE_DAYS.forEach(
                day => {

                    const cell =
                        document.createElement(
                            "td"
                        );


                    const key =
                        createTimetableKey(
                            day,
                            period
                        );


                    const classData =
                        schedule.classes[key];


                    if (classData) {

                        renderClassCard(
                            cell,
                            classData,
                            key,
                            data
                        );

                    }
                    else {

                        renderEmptySlot(
                            cell,
                            key
                        );

                    }


                    row.appendChild(
                        cell
                    );

                }
            );


            tbody.appendChild(
                row
            );

        }
    );


    /*
        合計単位
    */

    updateTotalCredits(
        data
    );

}


/* ==================================================
   時間割キー
================================================== */

function createTimetableKey(
    day,
    period
) {

    return `${day}${period}`;

}


/* ==================================================
   空きコマ
================================================== */

function renderEmptySlot(
    cell,
    key
) {

    const empty =
        document.createElement(
            "div"
        );


    empty.className =
        "empty-slot";


    empty.textContent =
        "+";


    /*
        空きコマを押すと
        その曜日・時限を選択した状態で
        授業追加画面を開く
    */

    empty.addEventListener(
        "click",
        function() {

            if (
                typeof openClassModal ===
                "function"
            ) {

                openClassModal(
                    null,
                    [key]
                );

            }

        }
    );


    cell.appendChild(
        empty
    );

}


/* ==================================================
   授業カード
================================================== */

function renderClassCard(
    cell,
    classData,
    key,
    data
) {

    const card =
        document.createElement(
            "div"
        );


    card.className =
        `class-card color-${classData.color || 1}`;


    /*
        授業名
    */

    const name =
        document.createElement(
            "div"
        );

    name.className =
        "class-name";

    name.textContent =
        classData.name || "授業";


    card.appendChild(
        name
    );


    /*
        教員
    */

    if (
        classData.teacher
    ) {

        const teacher =
            document.createElement(
                "div"
            );

        teacher.className =
            "teacher";

        teacher.textContent =
            classData.teacher;

        card.appendChild(
            teacher
        );

    }


    /*
        単位
    */

    const credit =
        document.createElement(
            "div"
        );

    credit.className =
        "credit";

    credit.textContent =
        `${classData.credit || 0}単位`;

    card.appendChild(
        credit
    );


    /*
        クリックで編集
    */

    card.addEventListener(
        "click",
        function() {

            if (
                typeof openClassModal ===
                "function"
            ) {

                openClassModal(
                    classData.id
                );

            }

        }
    );


    cell.appendChild(
        card
    );

}


/* ==================================================
   合計単位数
================================================== */

function updateTotalCredits(
    data
) {

    const element =
        document.getElementById(
            "totalCredit"
        );


    if (!element) {
        return;
    }


    const schedule =
        getCurrentSchedule(data);


    if (!schedule) {

        element.textContent =
            "0";

        return;

    }


    /*
        同じ授業が週2回あっても
        単位は1回だけ計算する
    */

    const countedClassIds =
        new Set();


    let total =
        0;


    Object.values(
        schedule.classes
    ).forEach(
        classData => {

            if (
                !classData ||
                !classData.id
            ) {

                return;

            }


            /*
                すでに計算済みなら
                スキップ
            */

            if (
                countedClassIds.has(
                    classData.id
                )
            ) {

                return;

            }


            countedClassIds.add(
                classData.id
            );


            total +=
                Number(
                    classData.credit
                ) || 0;

        }
    );


    element.textContent =
        total;

}


/* ==================================================
   授業を取得
================================================== */

function getClassById(
    data,
    classId
) {

    const schedule =
        getCurrentSchedule(data);


    if (!schedule) {
        return null;
    }


    for (
        const key of
        Object.keys(
            schedule.classes
        )
    ) {

        const classData =
            schedule.classes[key];


        if (
            classData &&
            classData.id ===
            classId
        ) {

            return classData;

        }

    }


    return null;

}


/* ==================================================
   授業が登録されているコマを取得
================================================== */

function getClassSlots(
    data,
    classId
) {

    const schedule =
        getCurrentSchedule(data);


    if (!schedule) {
        return [];
    }


    const slots = [];


    Object.keys(
        schedule.classes
    ).forEach(
        key => {

            const classData =
                schedule.classes[key];


            if (
                classData &&
                classData.id ===
                classId
            ) {

                slots.push(
                    key
                );

            }

        }
    );


    return slots;

}


/* ==================================================
   授業を保存
================================================== */

function saveClassData(
    data,
    classInfo,
    selectedSlots,
    editingClassId = null
) {

    const schedule =
        getCurrentSchedule(data);


    if (!schedule) {

        return {
            success: false,
            message:
                "時間割が見つかりません。"
        };

    }


    /*
        授業名
    */

    const name =
        String(
            classInfo.name || ""
        ).trim();


    if (!name) {

        return {
            success: false,
            message:
                "授業名を入力してください。"
        };

    }


    /*
        コマ数
    */

    if (
        !Array.isArray(
            selectedSlots
        ) ||
        selectedSlots.length === 0
    ) {

        return {
            success: false,
            message:
                "曜日・時限を1つ以上選択してください。"
        };

    }


    /*
        単位数
    */

    const credit =
        Number(
            classInfo.credit
        );


    if (
        !Number.isFinite(credit) ||
        credit < 0
    ) {

        return {
            success: false,
            message:
                "単位数を正しく入力してください。"
        };

    }


    /*
        編集中の場合
        以前のコマを削除
    */

    if (
        editingClassId
    ) {

        Object.keys(
            schedule.classes
        ).forEach(
            key => {

                const oldClass =
                    schedule.classes[key];


                if (
                    oldClass &&
                    oldClass.id ===
                    editingClassId
                ) {

                    delete schedule.classes[
                        key
                    ];

                }

            }
        );

    }


    /*
        同じコマに別の授業が
        入っているか確認
    */

    const conflicts = [];


    selectedSlots.forEach(
        key => {

            const existing =
                schedule.classes[key];


            if (!existing) {
                return;
            }


            /*
                編集対象の授業なら
                問題なし
            */

            if (
                editingClassId &&
                existing.id ===
                editingClassId
            ) {

                return;

            }


            conflicts.push({
                key: key,
                classData: existing
            });

        }
    );


    /*
        ID
    */

    const classId =
        editingClassId ||
        createUniqueId();


    /*
        授業データ
    */

    const newClass = {

        id: classId,

        name: name,

        teacher:
            String(
                classInfo.teacher || ""
            ).trim(),

        credit: credit,

        color:
            Number(
                classInfo.color
            ) || 1

    };


    /*
        上書き確認が必要な場合
    */

    if (
        conflicts.length > 0
    ) {

        const conflictText =
            conflicts
                .map(
                    conflict =>
                        `${conflict.key}：${conflict.classData.name}`
                )
                .join("\n");


        const confirmed =
            confirm(
                "以下のコマには既に授業があります。\n\n" +
                conflictText +
                "\n\n" +
                "この授業で上書きしますか？"
            );


        if (!confirmed) {

            /*
                編集時にすでに削除している場合、
                元の授業を復元する必要があるため、
                ここでは保存処理を中止する。
            */

            return {
                success: false,
                cancelled: true
            };

        }


        /*
            競合授業を削除
        */

        conflicts.forEach(
            conflict => {

                delete schedule.classes[
                    conflict.key
                ];

            }
        );

    }


    /*
        選択された全コマに
        同じ授業を登録
    */

    selectedSlots.forEach(
        key => {

            schedule.classes[key] = {
                ...newClass
            };

        }
    );


    /*
        保存
    */

    saveData(data);


    return {
        success: true,

        classId: classId
    };

}


/* ==================================================
   授業削除
================================================== */

function deleteClassData(
    data,
    classId
) {

    const schedule =
        getCurrentSchedule(data);


    if (!schedule) {

        return false;

    }


    let deleted =
        false;


    Object.keys(
        schedule.classes
    ).forEach(
        key => {

            const classData =
                schedule.classes[key];


            if (
                classData &&
                classData.id ===
                classId
            ) {

                delete schedule.classes[
                    key
                ];

                deleted = true;

            }

        }
    );


    if (deleted) {

        saveData(data);

    }


    return deleted;

}


/* ==================================================
   授業の存在チェック
================================================== */

function isClassSlotAvailable(
    data,
    key,
    editingClassId = null
) {

    const schedule =
        getCurrentSchedule(data);


    if (!schedule) {

        return false;

    }


    const existing =
        schedule.classes[key];


    /*
        空いている
    */

    if (!existing) {

        return true;

    }


    /*
        編集中の自分自身
    */

    if (
        editingClassId &&
        existing.id ===
        editingClassId
    ) {

        return true;

    }


    return false;

}


/* ==================================================
   時間割を追加
================================================== */

function addNewSchedule(
    data,
    name
) {

    const scheduleName =
        String(
            name || ""
        ).trim();


    if (!scheduleName) {

        return {
            success: false,
            message:
                "時間割名を入力してください。"
        };

    }


    const newSchedule = {

        id: createUniqueId(),

        name: scheduleName,

        classes: {}

    };


    data.schedules.push(
        newSchedule
    );


    data.currentSchedule =
        data.schedules.length - 1;


    saveData(data);


    return {
        success: true
    };

}


/* ==================================================
   時間割名変更
================================================== */

function renameCurrentSchedule(
    data,
    name
) {

    const schedule =
        getCurrentSchedule(data);


    if (!schedule) {

        return {
            success: false
        };

    }


    const newName =
        String(
            name || ""
        ).trim();


    if (!newName) {

        return {
            success: false,
            message:
                "時間割名を入力してください。"
        };

    }


    schedule.name =
        newName;


    saveData(data);


    return {
        success: true
    };

}


/* ==================================================
   時間割削除
================================================== */

function deleteCurrentSchedule(
    data
) {

    /*
        最低1つは残す
    */

    if (
        data.schedules.length <= 1
    ) {

        return {
            success: false,
            message:
                "時間割は最低1つ必要です。"
        };

    }


    data.schedules.splice(
        data.currentSchedule,
        1
    );


    /*
        現在位置を調整
    */

    if (
        data.currentSchedule >=
        data.schedules.length
    ) {

        data.currentSchedule =
            data.schedules.length - 1;

    }


    if (
        data.currentSchedule < 0
    ) {

        data.currentSchedule = 0;

    }


    saveData(data);


    return {
        success: true
    };

}
