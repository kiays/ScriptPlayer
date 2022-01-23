#ifndef MAINWINDOW_H
#define MAINWINDOW_H

#include <QMainWindow>
#include <QDropEvent>
#include <QMimeData>
#include <QFile>
#include <QFileDialog>
#include <QMessageBox>
#include <QString>
#include <QMediaPlayer>
#include <QAudioOutput>
QT_BEGIN_NAMESPACE
namespace Ui { class MainWindow; }
QT_END_NAMESPACE

class MainWindow : public QMainWindow
{
    Q_OBJECT

public:
    MainWindow(QWidget *parent = nullptr);
    ~MainWindow();

private slots:
    void on_fileOpenButton_clicked();
    void dropEvent(QDropEvent *event) override;
    void open();
    void on_playButton_clicked();

    void on_pauseButton_clicked();
        void durationChanged(qint64 duration);

        void on_seekBar_sliderMoved(int position);

private:
    Ui::MainWindow *ui;
    QString currentFile;
    QMediaPlayer* m_player;
    QAudioOutput* m_audio_output;
    qint64 m_duration;
};
#endif // MAINWINDOW_H
