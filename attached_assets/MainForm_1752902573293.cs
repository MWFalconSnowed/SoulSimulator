using System;
using System.IO;
using System.Windows.Forms;
using System.Drawing;

namespace SoulScriptWinForms
{
    public partial class MainForm : Form
    {
        public MainForm()
        {
            InitializeComponent();
this.FormBorderStyle = FormBorderStyle.None;
this.WindowState = FormWindowState.Maximized;
this.Padding = new Padding(20);
this.BackColor = Color.FromArgb(18, 18, 20); // 🖤 fond pur

editorTextBox.Font = new Font("Consolas", 12);
outputBox.Font = new Font("Consolas", 11);

runButton.FlatStyle = FlatStyle.Flat;
runButton.FlatAppearance.BorderSize = 0;
runButton.Cursor = Cursors.Hand;
runButton.Padding = new Padding(10, 5, 10, 5);

            // ✅ Thème Dark appliqué ici (dans le constructeur)
            this.BackColor = Color.FromArgb(24, 24, 28);
            editorTextBox.BackColor = Color.FromArgb(30, 30, 34);
            editorTextBox.ForeColor = Color.White;
            outputBox.BackColor = Color.FromArgb(20, 20, 24);
            outputBox.ForeColor = Color.LightGreen;
            runButton.BackColor = Color.FromArgb(50, 50, 58);
            runButton.ForeColor = Color.White;
            openButton.BackColor = runButton.BackColor;
            openButton.ForeColor = runButton.ForeColor;
        }

        private void runButton_Click(object sender, EventArgs e)
        {
            string code = editorTextBox.Text;
            string output = SoulInterpreter.Run(code);
            outputBox.Text = output;
        }

        private void openButton_Click(object sender, EventArgs e)
        {
            OpenFileDialog openFileDialog = new OpenFileDialog();
            openFileDialog.Filter = "SoulScript files (*.soul)|*.soul|All files (*.*)|*.*";

            if (openFileDialog.ShowDialog() == DialogResult.OK)
            {
                string filePath = openFileDialog.FileName;
                string content = File.ReadAllText(filePath);
                editorTextBox.Text = content;
            }
        }
    }
}
