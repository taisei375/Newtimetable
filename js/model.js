/* ==================================================
   modal.js
   授業・カレンダー予定のモーダル操作
================================================== */


/* ==================================================
   授業モーダル
================================================== */

let editingClassId = null;


/* ==================================================
   授業モーダルを開く
================================================== */

function openClassModal(
    classId = null,
    initialSlots = []
) {

    editingClassId =
        classId;


    const modal =
        document.getElementById(
            "classModal"
        );


    const title =
        document.getElementById(
            "classModalTitle"
        );


    const deleteButton =
        document.getElementById(
            "deleteClassButton"
        );


    if (!modal) {
        return;
    }


    /*
        入力欄を取得
    */

    const className =
        document.getElementById(
            "className"
        );

    const teacher =
        document.getElementById(
            "teacher"
        );

    const credit =
        document.getElementById(
            "credit"
        );


    /*
        初期化
    */

    className.value = "";

    teacher.value = "";

    credit.value = 2;


    /*
        色
    */

    selectClassColor(1);


    /*
        曜日・時限を作成
    */

    renderSlotSelection();


    /*
        編集の場合
    */

    if (classId) {

        title.textContent =
            "授業を編集";


        deleteButton.style.display =
            "block";


        const data =
            window.appData;


        if (data) {

            const classData =
                getClassById(
                    data,
                    classId
                );


            if (classData) {

                className.value =
                    classData.name || "";


                teacher.value =
                    classData.teacher || "";


                credit.value =
                    classData.credit ?? 0;


                selectClassColor(
                    classData.color || 1
                );


                /*
                    現在登録されている
                    全コマを選択
                */

                const slots =
                    getClassSlots(
                        data,
                        classId
                    );


                selectSlots(
                    slots
                );

            }

        }

    }

    /*
        新規追加
    */

    else {

        title.textContent =
            "授業を追加";


        deleteButton.style.display =
            "none";


        /*
            空きコマから開いた場合
        */

        if (
            Array.isArray(
                initialSlots
            )
        ) {

            selectSlots(
                initialSlots
            );

        }

    }


    updateSelectedSlotCount();


    /*
        表示
    */

    modal.classList.add(
        "active"
    );


    /*
        授業名にフォーカス
    */

    setTimeout(
        () => {

            className.focus();

        },
        50
    );

}


/* ==================================================
   授業モーダルを閉じる
================================================== */

function closeClassModal() {

    const modal =
        document.getElementById(
            "classModal"
        );


    if (modal) {

        modal.classList.remove(
            "active"
        );

    }


    editingClassId =
        null;

}


/* ==================================================
   曜日・時限選択を作成
================================================== */

function renderSlotSelection() {

    const container =
        document.getElementById(
            "slotGrid"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    const data =
        window.appData;


    /*
        月〜金 × 1〜5限
    */

    TIMETABLE_DAYS.forEach(
        day => {

            TIMETABLE_PERIODS.forEach(
                period => {

                    const key =
                        createTimetableKey(
                            day,
                            period
                        );


                    const slot =
                        document.createElement(
                            "button"
                        );


                    slot.type =
                        "button";


                    slot.className =
                        "slot";


                    slot.dataset.key =
                        key;


                    /*
                        曜日
                    */

                    const dayElement =
                        document.createElement(
                            "div"
                        );


                    dayElement.className =
                        "slot-day";


                    dayElement.textContent =
                        day;


                    /*
                        時限
                    */

                    const periodElement =
                        document.createElement(
                            "div"
                        );


                    periodElement.className =
                        "slot-period";


                    periodElement.textContent =
                        `${period}限`;


                    slot.appendChild(
                        dayElement
                    );


                    slot.appendChild(
                        periodElement
                    );


                    /*
                        選択
                    */

                    slot.addEventListener(
                        "click",
                        function() {

                            toggleSlot(
                                key
                            );

                        }
                    );


                    container.appendChild(
                        slot
                    );

                }
            );

        }
    );


    /*
        現在の時間割に授業がある
        コマには薄く表示
    */

    updateOccupiedSlots();

}


/* ==================================================
   コマ選択切り替え
================================================== */

function toggleSlot(
    key
) {

    const slot =
        document.querySelector(
            `.slot[data-key="${key}"]`
        );


    if (!slot) {
        return;
    }


    /*
        選択状態を変更
    */

    slot.classList.toggle(
        "selected"
    );


    updateSelectedSlotCount();

}


/* ==================================================
   複数コマを選択
================================================== */

function selectSlots(
    keys
) {

    if (
        !Array.isArray(keys)
    ) {

        return;

    }


    keys.forEach(
        key => {

            const slot =
                document.querySelector(
                    `.slot[data-key="${key}"]`
                );


            if (slot) {

                slot.classList.add(
                    "selected"
                );

            }

        }
    );


    updateSelectedSlotCount();

}


/* ==================================================
   選択中のコマを取得
================================================== */

function getSelectedSlots() {

    const slots =
        document.querySelectorAll(
            ".slot.selected"
        );


    return Array.from(
        slots
    ).map(
        slot =>
            slot.dataset.key
    );

}


/* ==================================================
   選択コマ数表示
================================================== */

function updateSelectedSlotCount() {

    const element =
        document.getElementById(
            "selectedSlotCount"
        );


    if (!element) {
        return;
    }


    element.textContent =
        getSelectedSlots().length;

}


/* ==================================================
   使用中のコマを表示
================================================== */

function updateOccupiedSlots() {

    const data =
        window.appData;


    if (!data) {
        return;
    }


    const schedule =
        getCurrentSchedule(
            data
        );


    if (!schedule) {
        return;
    }


    document
        .querySelectorAll(
            ".slot"
        )
        .forEach(
            slot => {

                const key =
                    slot.dataset.key;


                const existing =
                    schedule.classes[key];


                /*
                    現在編集中の授業なら
                    使用中扱いにしない
                */

                if (
                    existing &&
                    existing.id !==
                    editingClassId
                ) {

                    slot.classList.add(
                        "occupied"
                    );

                }
                else {

                    slot.classList.remove(
                        "occupied"
                    );

                }

            }
        );

}


/* ==================================================
   色選択
================================================== */

function selectClassColor(
    color
) {

    const buttons =
        document.querySelectorAll(
            ".color-option"
        );


    buttons.forEach(
        button => {

            button.classList.remove(
                "selected"
            );


            if (
                Number(
                    button.dataset.color
                ) ===
                Number(color)
            ) {

                button.classList.add(
                    "selected"
                );

            }

        }
    );

}


/* ==================================================
   選択中の色を取得
================================================== */

function getSelectedClassColor() {

    const selected =
        document.querySelector(
            ".color-option.selected"
        );


    if (!selected) {

        return 1;

    }


    return Number(
        selected.dataset.color
    );

}


/* ==================================================
   授業を保存
================================================== */

function handleSaveClass() {

    const data =
        window.appData;


    if (!data) {
        return;
    }


    /*
        入力値
    */

    const name =
        document.getElementById(
            "className"
        ).value;


    const teacher =
        document.getElementById(
            "teacher"
        ).value;


    const credit =
        document.getElementById(
            "credit"
        ).value;


    const selectedSlots =
        getSelectedSlots();


    const color =
        getSelectedClassColor();


    /*
        保存
    */

    const result =
        saveClassData(
            data,
            {
                name: name,

                teacher: teacher,

                credit: credit,

                color: color

            },
            selectedSlots,
            editingClassId
        );


    if (!result.success) {

        /*
            キャンセルの場合は
            エラー表示しない
        */

        if (
            !result.cancelled &&
            result.message
        ) {

            alert(
                result.message
            );

        }

        return;

    }


    /*
        モーダルを閉じる
    */

    closeClassModal();


    /*
        表示更新
    */

    renderTimetable(
        data
    );


    renderScheduleSelect(
        data
    );

}


/* ==================================================
   授業削除
================================================== */

function handleDeleteClass() {

    const data =
        window.appData;


    if (
        !data ||
        !editingClassId
    ) {

        return;

    }


    const classData =
        getClassById(
            data,
            editingClassId
        );


    if (!classData) {

        closeClassModal();

        return;

    }


    const confirmed =
        confirm(
            `「${classData.name}」を時間割から削除しますか？`
        );


    if (!confirmed) {
        return;
    }


    deleteClassData(
        data,
        editingClassId
    );


    closeClassModal();


    renderTimetable(
        data
    );

}


/* ==================================================
   予定モーダル
================================================== */

let editingEventId = null;


/* ==================================================
   予定追加・編集画面
================================================== */

function openEventModal(
    eventId = null,
    initialDate = null
) {

    editingEventId =
        eventId;


    const modal =
        document.getElementById(
            "eventModal"
        );


    const title =
        document.getElementById(
            "eventModalTitle"
        );


    const deleteButton =
        document.getElementById(
            "deleteEventButton"
        );


    if (!modal) {
        return;
    }


    /*
        入力欄
    */

    const dateInput =
        document.getElementById(
            "eventDate"
        );


    const titleInput =
        document.getElementById(
            "eventTitle"
        );


    const startInput =
        document.getElementById(
            "eventStartTime"
        );


    const endInput =
        document.getElementById(
            "eventEndTime"
        );


    const memoInput =
        document.getElementById(
            "eventMemo"
        );


    /*
        初期化
    */

    dateInput.value =
        initialDate ||
        getTodayString();


    titleInput.value =
        "";

    startInput.value =
        "";

    endInput.value =
        "";

    memoInput.value =
        "";


    /*
        編集
    */

    if (eventId) {

        title.textContent =
            "予定を編集";


        deleteButton.style.display =
            "block";


        const data =
            window.appData;


        const eventData =
            getEventById(
                data,
                eventId
            );


        if (eventData) {

            dateInput.value =
                eventData.date ||
                getTodayString();


            titleInput.value =
                eventData.title || "";


            startInput.value =
                eventData.startTime || "";


            endInput.value =
                eventData.endTime || "";


            memoInput.value =
                eventData.memo || "";

        }

    }

    /*
        新規追加
    */

    else {

        title.textContent =
            "予定を追加";


        deleteButton.style.display =
            "none";

    }


    /*
        表示
    */

    modal.classList.add(
        "active"
    );


    setTimeout(
        () => {

            titleInput.focus();

        },
        50
    );

}


/* ==================================================
   予定モーダルを閉じる
================================================== */

function closeEventModal() {

    const modal =
        document.getElementById(
            "eventModal"
        );


    if (modal) {

        modal.classList.remove(
            "active"
        );

    }


    editingEventId =
        null;

}


/* ==================================================
   予定保存
================================================== */

function handleSaveEvent() {

    const data =
        window.appData;


    if (!data) {
        return;
    }


    const date =
        document.getElementById(
            "eventDate"
        ).value;


    const title =
        document.getElementById(
            "eventTitle"
        ).value;


    const startTime =
        document.getElementById(
            "eventStartTime"
        ).value;


    const endTime =
        document.getElementById(
            "eventEndTime"
        ).value;


    const memo =
        document.getElementById(
            "eventMemo"
        ).value;


    const result =
        saveEventData(
            data,
            {
                date: date,

                title: title,

                startTime:
                    startTime,

                endTime:
                    endTime,

                memo: memo

            },
            editingEventId
        );


    if (!result.success) {

        if (
            result.message
        ) {

            alert(
                result.message
            );

        }

        return;

    }


    closeEventModal();


    renderCalendar(
        data
    );

}


/* ==================================================
   予定削除
================================================== */

function handleDeleteEvent() {

    const data =
        window.appData;


    if (
        !data ||
        !editingEventId
    ) {

        return;

    }


    const eventData =
        getEventById(
            data,
            editingEventId
        );


    if (!eventData) {

        closeEventModal();

        return;

    }


    const confirmed =
        confirm(
            `「${eventData.title}」を削除しますか？`
        );


    if (!confirmed) {
        return;
    }


    deleteEventData(
        data,
        editingEventId
    );


    closeEventModal();


    renderCalendar(
        data
    );

}


/* ==================================================
   モーダル外側クリック
================================================== */

function setupModalOutsideClick() {

    const classModal =
        document.getElementById(
            "classModal"
        );


    const eventModal =
        document.getElementById(
            "eventModal"
        );


    if (classModal) {

        classModal.addEventListener(
            "click",
            function(event) {

                if (
                    event.target ===
                    classModal
                ) {

                    closeClassModal();

                }

            }
        );

    }


    if (eventModal) {

        eventModal.addEventListener(
            "click",
            function(event) {

                if (
                    event.target ===
                    eventModal
                ) {

                    closeEventModal();

                }

            }
        );

    }

}


/* ==================================================
   ESCキーで閉じる
================================================== */

function setupModalEscapeKey() {

    document.addEventListener(
        "keydown",
        function(event) {

            if (
                event.key !==
                "Escape"
            ) {

                return;

            }


            closeClassModal();

            closeEventModal();

        }
    );

}


/* ==================================================
   モーダルのイベント設定
================================================== */

function setupModalEvents() {

    /*
        授業
    */

    document
        .getElementById(
            "closeClassModalButton"
        )
        ?.addEventListener(
            "click",
            closeClassModal
        );


    document
        .getElementById(
            "cancelClassButton"
        )
        ?.addEventListener(
            "click",
            closeClassModal
        );


    document
        .getElementById(
            "saveClassButton"
        )
        ?.addEventListener(
            "click",
            handleSaveClass
        );


    document
        .getElementById(
            "deleteClassButton"
        )
        ?.addEventListener(
            "click",
            handleDeleteClass
        );


    /*
        色
    */

    document
        .querySelectorAll(
            ".color-option"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    function() {

                        selectClassColor(
                            button.dataset.color
                        );

                    }
                );

            }
        );


    /*
        カレンダー予定
    */

    document
        .getElementById(
            "closeEventModalButton"
        )
        ?.addEventListener(
            "click",
            closeEventModal
        );


    document
        .getElementById(
            "cancelEventButton"
        )
        ?.addEventListener(
            "click",
            closeEventModal
        );


    document
        .getElementById(
            "saveEventButton"
        )
        ?.addEventListener(
            "click",
            handleSaveEvent
        );


    document
        .getElementById(
            "deleteEventButton"
        )
        ?.addEventListener(
            "click",
            handleDeleteEvent
        );


    /*
        その他
    */

    setupModalOutsideClick();

    setupModalEscapeKey();

}
